"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const family_tree_controller_1 = require("./family-tree.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new family_tree_controller_1.FamilyTreeController();
router.get('/', auth_middleware_1.authenticate, controller.getTree);
exports.default = router;
//# sourceMappingURL=family-tree.routes.js.map