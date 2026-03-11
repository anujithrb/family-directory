import { Request, Response, NextFunction } from 'express';
import { PermissionKey } from '@prisma/client';
/**
 * Middleware to check if user has a specific permission
 */
export declare function requirePermission(permission: PermissionKey): (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=permission.middleware.d.ts.map