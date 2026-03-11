"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const controller = new users_controller_1.UsersController();
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN));
router.get('/', controller.getUsers);
router.get('/:id', controller.getUser);
router.patch('/:id/role', controller.updateRole);
router.patch('/:id/active', controller.setActive);
router.get('/:id/permissions', controller.getPermissions);
router.post('/:id/permissions', controller.grantPermission);
router.delete('/:id/permissions', controller.revokePermission);
exports.default = router;
//# sourceMappingURL=users.routes.js.map