"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const env_1 = require("../../config/env");
const router = (0, express_1.Router)();
const controller = new auth_controller_1.AuthController();
const authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
    max: env_1.env.RATE_LIMIT_MAX,
    message: { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post('/register', authRateLimiter, controller.register);
router.post('/login', authRateLimiter, controller.login);
router.post('/refresh', authRateLimiter, controller.refresh);
router.post('/logout', auth_middleware_1.authenticate, controller.logout);
router.get('/me', auth_middleware_1.authenticate, controller.me);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map