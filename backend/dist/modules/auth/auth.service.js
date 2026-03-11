"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const prisma_1 = require("../../config/prisma");
const redis_1 = require("../../config/redis");
const env_1 = require("../../config/env");
const error_middleware_1 = require("../../middleware/error.middleware");
const auth_repository_1 = require("./auth.repository");
const client_1 = require("@prisma/client");
class AuthService {
    authRepo;
    constructor() {
        this.authRepo = new auth_repository_1.AuthRepository();
    }
    /**
     * Register a new user
     * @param dto - Registration data
     * @returns The created user (without password)
     * @throws AppError if email exists or familyMember is already linked
     */
    async register(dto) {
        const existing = await this.authRepo.findUserByEmail(dto.email);
        if (existing) {
            throw new error_middleware_1.AppError(409, 'EMAIL_EXISTS', 'Email already registered');
        }
        const member = await prisma_1.prisma.familyMember.findUnique({ where: { id: dto.familyMemberId } });
        if (!member) {
            throw new error_middleware_1.AppError(404, 'MEMBER_NOT_FOUND', 'Family member not found');
        }
        if (member.linkedUserId) {
            throw new error_middleware_1.AppError(409, 'MEMBER_LINKED', 'Family member already has a linked user');
        }
        const passwordHash = await bcrypt_1.default.hash(dto.password, 12);
        const user = await prisma_1.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                role: client_1.Role.USER,
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
    async login(dto) {
        const user = await this.authRepo.findUserByEmail(dto.email);
        if (!user || !user.isActive) {
            throw new error_middleware_1.AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }
        const passwordMatch = await bcrypt_1.default.compare(dto.password, user.passwordHash);
        if (!passwordMatch) {
            throw new error_middleware_1.AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }
        return this.generateTokenPair(user.id, user.email, user.role, user.familyMemberId);
    }
    /**
     * Refresh access token using refresh token
     * @param refreshToken - The refresh token from cookie
     * @returns New token pair
     * @throws AppError if token is invalid or expired
     */
    async refresh(refreshToken) {
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
        }
        catch {
            throw new error_middleware_1.AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
        }
        const storedToken = await prisma_1.prisma.refreshToken.findFirst({
            where: { userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } },
        });
        if (!storedToken) {
            throw new error_middleware_1.AppError(401, 'REFRESH_TOKEN_EXPIRED', 'Refresh token not found or expired');
        }
        const valid = await bcrypt_1.default.compare(refreshToken, storedToken.tokenHash);
        if (!valid) {
            throw new error_middleware_1.AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token mismatch');
        }
        await this.authRepo.revokeRefreshToken(storedToken.id);
        const user = await this.authRepo.findUserById(payload.sub);
        if (!user || !user.isActive) {
            throw new error_middleware_1.AppError(401, 'USER_INACTIVE', 'User account is inactive');
        }
        return this.generateTokenPair(user.id, user.email, user.role, user.familyMemberId);
    }
    /**
     * Logout user by revoking the access token (blocklist) and refresh token
     * @param userId - User ID
     * @param jti - JWT ID of access token to revoke
     * @param tokenExp - Expiry time of access token
     */
    async logout(userId, jti, tokenExp) {
        const ttl = tokenExp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
            await redis_1.redis.setex(`blocklist:${jti}`, ttl, '1');
        }
        await this.authRepo.revokeAllUserRefreshTokens(userId);
    }
    /**
     * Get current user profile
     * @param userId - User ID
     */
    async getMe(userId) {
        const user = await prisma_1.prisma.user.findUnique({
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
            throw new error_middleware_1.AppError(404, 'USER_NOT_FOUND', 'User not found');
        }
        return user;
    }
    async generateTokenPair(userId, email, role, familyMemberId) {
        const jti = (0, uuid_1.v4)();
        const accessToken = jsonwebtoken_1.default.sign({ sub: userId, email, role, familyMemberId, jti }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_ACCESS_EXPIRES_IN });
        const signedRefreshToken = jsonwebtoken_1.default.sign({ sub: userId, jti: (0, uuid_1.v4)() }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        const refreshTokenHash = await bcrypt_1.default.hash(signedRefreshToken, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.authRepo.createRefreshToken(userId, refreshTokenHash, expiresAt);
        return { accessToken, refreshToken: signedRefreshToken };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map