"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const redis_1 = require("../config/redis");
const error_middleware_1 = require("./error.middleware");
/**
 * Middleware to authenticate JWT access tokens
 */
async function authenticate(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new error_middleware_1.AppError(401, 'UNAUTHORIZED', 'No token provided');
        }
        const token = authHeader.substring(7);
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // Check if token is revoked
        const isRevoked = await redis_1.redis.get(`blocklist:${payload.jti}`);
        if (isRevoked) {
            throw new error_middleware_1.AppError(401, 'TOKEN_REVOKED', 'Token has been revoked');
        }
        req.user = payload;
        next();
    }
    catch (err) {
        if (err instanceof error_middleware_1.AppError) {
            next(err);
        }
        else if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new error_middleware_1.AppError(401, 'INVALID_TOKEN', 'Invalid token'));
        }
        else if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new error_middleware_1.AppError(401, 'TOKEN_EXPIRED', 'Token has expired'));
        }
        else {
            next(err);
        }
    }
}
/**
 * Middleware factory to require specific roles
 */
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new error_middleware_1.AppError(401, 'UNAUTHORIZED', 'Not authenticated'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new error_middleware_1.AppError(403, 'FORBIDDEN', 'Insufficient permissions'));
        }
        next();
    };
}
//# sourceMappingURL=auth.middleware.js.map