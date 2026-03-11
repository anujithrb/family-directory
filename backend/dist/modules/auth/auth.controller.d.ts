import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    private readonly service;
    constructor();
    /**
     * @openapi
     * /auth/register:
     *   post:
     *     tags: [Auth]
     *     summary: Register a new user
     */
    register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * @openapi
     * /auth/login:
     *   post:
     *     tags: [Auth]
     *     summary: Login with email and password
     */
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * @openapi
     * /auth/refresh:
     *   post:
     *     tags: [Auth]
     *     summary: Refresh access token
     */
    refresh: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * @openapi
     * /auth/logout:
     *   post:
     *     tags: [Auth]
     *     summary: Logout and revoke tokens
     */
    logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * @openapi
     * /auth/me:
     *   get:
     *     tags: [Auth]
     *     summary: Get current user profile
     */
    me: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map