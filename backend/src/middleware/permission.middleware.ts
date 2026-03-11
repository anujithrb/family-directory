import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from './error.middleware';
import { PermissionKey, Role } from '@prisma/client';

/**
 * Middleware to check if user has a specific permission
 */
export function requirePermission(permission: PermissionKey) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Not authenticated'));
    }

    if (req.user.role === Role.ADMIN) {
      return next();
    }

    const perm = await prisma.userPermission.findUnique({
      where: {
        userId_permissionKey: {
          userId: req.user.sub,
          permissionKey: permission,
        },
      },
    });

    if (!perm) {
      return next(new AppError(403, 'FORBIDDEN', `Permission ${permission} required`));
    }

    next();
  };
}
