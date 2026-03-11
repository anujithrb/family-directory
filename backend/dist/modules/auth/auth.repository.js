"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const prisma_1 = require("../../config/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthRepository {
    /**
     * Find a user by email
     */
    async findUserByEmail(email) {
        return prisma_1.prisma.user.findUnique({
            where: { email },
        });
    }
    /**
     * Find a user by ID
     */
    async findUserById(id) {
        return prisma_1.prisma.user.findUnique({
            where: { id },
            include: { familyMember: true, permissions: true },
        });
    }
    /**
     * Create a refresh token record
     */
    async createRefreshToken(userId, tokenHash, expiresAt) {
        return prisma_1.prisma.refreshToken.create({
            data: { userId, tokenHash, expiresAt },
        });
    }
    /**
     * Find an active refresh token by hash
     */
    async findRefreshToken(tokenHash) {
        return prisma_1.prisma.refreshToken.findFirst({
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
    async revokeRefreshToken(id) {
        await prisma_1.prisma.refreshToken.update({
            where: { id },
            data: { revokedAt: new Date() },
        });
    }
    /**
     * Revoke all refresh tokens for a user
     */
    async revokeAllUserRefreshTokens(userId) {
        await prisma_1.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    /**
     * Hash a token value
     */
    async hashToken(token) {
        return bcrypt_1.default.hash(token, 10);
    }
    /**
     * Compare a token with its hash
     */
    async compareToken(token, hash) {
        return bcrypt_1.default.compare(token, hash);
    }
}
exports.AuthRepository = AuthRepository;
//# sourceMappingURL=auth.repository.js.map