import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../config/prisma';
import { redis } from '../../config/redis';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error.middleware';
import { AuthRepository } from './auth.repository';
import { Role } from '@prisma/client';

export interface RegisterDto {
  email: string;
  password: string;
  familyMemberId: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly authRepo: AuthRepository;

  constructor() {
    this.authRepo = new AuthRepository();
  }

  /**
   * Register a new user
   * @param dto - Registration data
   * @returns The created user (without password)
   * @throws AppError if email exists or familyMember is already linked
   */
  async register(dto: RegisterDto) {
    const existing = await this.authRepo.findUserByEmail(dto.email);
    if (existing) {
      throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered');
    }

    const member = await prisma.familyMember.findUnique({ where: { id: dto.familyMemberId } });
    if (!member) {
      throw new AppError(404, 'MEMBER_NOT_FOUND', 'Family member not found');
    }

    if (member.linkedUserId) {
      throw new AppError(409, 'MEMBER_LINKED', 'Family member already has a linked user');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: Role.USER,
        familyMemberId: dto.familyMemberId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        familyMemberId: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Login a user and return token pair
   * @param dto - Login credentials
   * @returns Token pair (access + refresh)
   * @throws AppError if credentials are invalid
   */
  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.authRepo.findUserByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    return this.generateTokenPair(user.id, user.email, user.role, user.familyMemberId);
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken - The refresh token from cookie
   * @returns New token pair
   * @throws AppError if token is invalid or expired
   */
  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: { sub: string; jti: string };
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string; jti: string };
    } catch {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
    }

    const storedToken = await prisma.refreshToken.findFirst({
      where: { userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } },
    });

    if (!storedToken) {
      throw new AppError(401, 'REFRESH_TOKEN_EXPIRED', 'Refresh token not found or expired');
    }

    const valid = await bcrypt.compare(refreshToken, storedToken.tokenHash);
    if (!valid) {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token mismatch');
    }

    await this.authRepo.revokeRefreshToken(storedToken.id);

    const user = await this.authRepo.findUserById(payload.sub);
    if (!user || !user.isActive) {
      throw new AppError(401, 'USER_INACTIVE', 'User account is inactive');
    }

    return this.generateTokenPair(user.id, user.email, user.role, user.familyMemberId);
  }

  /**
   * Logout user by revoking the access token (blocklist) and refresh token
   * @param userId - User ID
   * @param jti - JWT ID of access token to revoke
   * @param tokenExp - Expiry time of access token
   */
  async logout(userId: string, jti: string, tokenExp: number): Promise<void> {
    const ttl = tokenExp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await redis.setex(`blocklist:${jti}`, ttl, '1');
    }
    await this.authRepo.revokeAllUserRefreshTokens(userId);
  }

  /**
   * Get current user profile
   * @param userId - User ID
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        familyMemberId: true,
        isActive: true,
        createdAt: true,
        familyMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        permissions: {
          select: { permissionKey: true },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return user;
  }

  private async generateTokenPair(userId: string, email: string, role: Role, familyMemberId: string): Promise<TokenPair> {
    const jti = uuidv4();

    const accessToken = jwt.sign(
      { sub: userId, email, role, familyMemberId, jti },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
    );

    const signedRefreshToken = jwt.sign(
      { sub: userId, jti: uuidv4() },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' },
    );

    const refreshTokenHash = await bcrypt.hash(signedRefreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.authRepo.createRefreshToken(userId, refreshTokenHash, expiresAt);

    return { accessToken, refreshToken: signedRefreshToken };
  }
}
