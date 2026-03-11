"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("./auth.service");
const env_1 = require("../../config/env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    familyMemberId: zod_1.z.string().cuid(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
class AuthController {
    service;
    constructor() {
        this.service = new auth_service_1.AuthService();
    }
    /**
     * @openapi
     * /auth/register:
     *   post:
     *     tags: [Auth]
     *     summary: Register a new user
     */
    register = async (req, res, next) => {
        try {
            const dto = registerSchema.parse(req.body);
            const user = await this.service.register(dto);
            res.status(201).json({ data: user });
        }
        catch (err) {
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
    login = async (req, res, next) => {
        try {
            const dto = loginSchema.parse(req.body);
            const tokens = await this.service.login(dto);
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: env_1.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/api/auth',
            });
            res.json({ data: { accessToken: tokens.accessToken } });
        }
        catch (err) {
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
    refresh = async (req, res, next) => {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                res.status(401).json({ error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token' } });
                return;
            }
            const tokens = await this.service.refresh(refreshToken);
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: env_1.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/api/auth',
            });
            res.json({ data: { accessToken: tokens.accessToken } });
        }
        catch (err) {
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
    logout = async (req, res, next) => {
        try {
            const user = req.user;
            const authHeader = req.headers.authorization;
            const token = authHeader.substring(7);
            const decoded = jsonwebtoken_1.default.decode(token);
            await this.service.logout(user.sub, decoded.jti, decoded.exp);
            res.clearCookie('refreshToken', { path: '/api/auth' });
            res.json({ data: { message: 'Logged out successfully' } });
        }
        catch (err) {
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
    me = async (req, res, next) => {
        try {
            const user = req.user;
            const profile = await this.service.getMe(user.sub);
            res.json({ data: profile });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map