import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
export interface JwtPayload {
    sub: string;
    email: string;
    role: Role;
    jti: string;
    familyMemberId: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
/**
 * Middleware to authenticate JWT access tokens
 */
export declare function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void>;
/**
 * Middleware factory to require specific roles
 */
export declare function requireRole(...roles: Role[]): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map