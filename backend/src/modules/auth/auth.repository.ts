import { prisma } from '../../config/prisma';
import { User, RefreshToken } from '@prisma/client';
import bcrypt from 'bcryptjs';

export class AuthRepository {
  /**
   * Find a user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find a user by ID
   */
  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { familyMember: true, permissions: true },
    });
  }

  /**
   * Create a refresh token record
   */
  async createRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  /**
   * Find an active refresh token by hash
   */
  async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  /**
   * Revoke a refresh token
   */
  async revokeRefreshToken(id: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Hash a token value
   */
  async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  /**
   * Compare a token with its hash
   */
  async compareToken(token: string, hash: string): Promise<boolean> {
    return bcrypt.compare(token, hash);
  }
}
