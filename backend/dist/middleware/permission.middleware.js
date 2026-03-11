"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = requirePermission;
const prisma_1 = require("../config/prisma");
const error_middleware_1 = require("./error.middleware");
const client_1 = require("@prisma/client");
/**
 * Middleware to check if user has a specific permission
 */
function requirePermission(permission) {
    return async (req, _res, next) => {
        if (!req.user) {
            return next(new error_middleware_1.AppError(401, 'UNAUTHORIZED', 'Not authenticated'));
        }
        if (req.user.role === client_1.Role.ADMIN) {
            return next();
        }
        const perm = await prisma_1.prisma.userPermission.findUnique({
            where: {
                userId_permissionKey: {
                    userId: req.user.sub,
                    permissionKey: permission,
                },
            },
        });
        if (!perm) {
            return next(new error_middleware_1.AppError(403, 'FORBIDDEN', `Permission ${permission} required`));
        }
        next();
    };
}
//# sourceMappingURL=permission.middleware.js.map