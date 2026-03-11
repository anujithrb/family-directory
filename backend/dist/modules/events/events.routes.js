"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const events_controller_1 = require("./events.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const controller = new events_controller_1.EventsController();
router.get('/', auth_middleware_1.authenticate, controller.getEvents);
router.get('/:id', auth_middleware_1.authenticate, controller.getEvent);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.USER), controller.createEvent);
router.patch('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.USER), controller.updateEvent);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), controller.deleteEvent);
exports.default = router;
//# sourceMappingURL=events.routes.js.map