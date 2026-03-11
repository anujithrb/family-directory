import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { env } from '../../config/env';
import { JwtPayload } from '../../middleware/auth.middleware';
import jwt from 'jsonwebtoken';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  familyMemberId: z.string().cuid(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class AuthController {
  private readonly service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  /**
   * @openapi
   * /auth/register:
   *   post:
   *     tags: [Auth]
   *     summary: Register a new user
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = registerSchema.parse(req.body);
      const user = await this.service.register(dto);
      res.status(201).json({ data: user });
    } catch (err) {
      next(err);
    }
  };

  /**
   * @openapi
   * /auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Login with email and password
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = loginSchema.parse(req.body);
      const tokens = await this.service.login(dto);
      
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth',
      });

      res.json({ data: { accessToken: tokens.accessToken } });
    } catch (err) {
      next(err);
    }
  };

  /**
   * @openapi
   * /auth/refresh:
   *   post:
   *     tags: [Auth]
   *     summary: Refresh access token
   */
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;
      if (!refreshToken) {
        res.status(401).json({ error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token' } });
        return;
      }
      const tokens = await this.service.refresh(refreshToken);
      
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth',
      });

      res.json({ data: { accessToken: tokens.accessToken } });
    } catch (err) {
      next(err);
    }
  };

  /**
   * @openapi
   * /auth/logout:
   *   post:
   *     tags: [Auth]
   *     summary: Logout and revoke tokens
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as JwtPayload;
      const authHeader = req.headers.authorization!;
      const token = authHeader.substring(7);
      const decoded = jwt.decode(token) as { exp: number; jti: string };
      
      await this.service.logout(user.sub, decoded.jti, decoded.exp);
      
      res.clearCookie('refreshToken', { path: '/api/auth' });
      res.json({ data: { message: 'Logged out successfully' } });
    } catch (err) {
      next(err);
    }
  };

  /**
   * @openapi
   * /auth/me:
   *   get:
   *     tags: [Auth]
   *     summary: Get current user profile
   */
  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as JwtPayload;
      const profile = await this.service.getMe(user.sub);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  };
}
