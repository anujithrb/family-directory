"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const files_controller_1 = require("./files.controller");
const router = (0, express_1.Router)();
const controller = new files_controller_1.FilesController();
router.get('/:filename', controller.serveFile);
exports.default = router;
//# sourceMappingURL=files.routes.js.map