"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const relationships_controller_1 = require("./relationships.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const controller = new relationships_controller_1.RelationshipsController();
router.get('/member/:memberId', auth_middleware_1.authenticate, controller.getRelationships);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.USER), controller.addRelationship);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), controller.removeRelationship);
exports.default = router;
//# sourceMappingURL=relationships.routes.js.map