import { User, RefreshToken } from '@prisma/client';
export declare class AuthRepository {
    /**
     * Find a user by email
     */
    findUserByEmail(email: string): Promise<User | null>;
    /**
     * Find a user by ID
     */
    findUserById(id: string): Promise<User | null>;
    /**
     * Create a refresh token record
     */
    createRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshToken>;
    /**
     * Find an active refresh token by hash
     */
    findRefreshToken(tokenHash: string): Promise<RefreshToken | null>;
    /**
     * Revoke a refresh token
     */
    revokeRefreshToken(id: string): Promise<void>;
    /**
     * Revoke all refresh tokens for a user
     */
    revokeAllUserRefreshTokens(userId: string): Promise<void>;
    /**
     * Hash a token value
     */
    hashToken(token: string): Promise<string>;
    /**
     * Compare a token with its hash
     */
    compareToken(token: string, hash: string): Promise<boolean>;
}
//# sourceMappingURL=auth.repository.d.ts.map