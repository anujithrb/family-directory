import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { redis } from '../config/redis';
import { AppError } from './error.middleware';
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
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'No token provided');
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Check if token is revoked
    const isRevoked = await redis.get(`blocklist:${payload.jti}`);
    if (isRevoked) {
      throw new AppError(401, 'TOKEN_REVOKED', 'Token has been revoked');
    }

    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
    } else if (err instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'INVALID_TOKEN', 'Invalid token'));
    } else if (err instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'TOKEN_EXPIRED', 'Token has expired'));
    } else {
      next(err);
    }
  }
}

/**
 * Middleware factory to require specific roles
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'FORBIDDEN', 'Insufficient permissions'));
    }
    next();
  };
}
