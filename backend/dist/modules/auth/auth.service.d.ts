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
export declare class AuthService {
    private readonly authRepo;
    constructor();
    /**
     * Register a new user
     * @param dto - Registration data
     * @returns The created user (without password)
     * @throws AppError if email exists or familyMember is already linked
     */
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        familyMemberId: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    /**
     * Login a user and return token pair
     * @param dto - Login credentials
     * @returns Token pair (access + refresh)
     * @throws AppError if credentials are invalid
     */
    login(dto: LoginDto): Promise<TokenPair>;
    /**
     * Refresh access token using refresh token
     * @param refreshToken - The refresh token from cookie
     * @returns New token pair
     * @throws AppError if token is invalid or expired
     */
    refresh(refreshToken: string): Promise<TokenPair>;
    /**
     * Logout user by revoking the access token (blocklist) and refresh token
     * @param userId - User ID
     * @param jti - JWT ID of access token to revoke
     * @param tokenExp - Expiry time of access token
     */
    logout(userId: string, jti: string, tokenExp: number): Promise<void>;
    /**
     * Get current user profile
     * @param userId - User ID
     */
    getMe(userId: string): Promise<{
        familyMember: {
            id: string;
            firstName: string;
            lastName: string;
            photoUrl: string | null;
        };
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        familyMemberId: string;
        isActive: boolean;
        createdAt: Date;
        permissions: {
            permissionKey: import(".prisma/client").$Enums.PermissionKey;
        }[];
    }>;
    private generateTokenPair;
}
//# sourceMappingURL=auth.service.d.ts.map