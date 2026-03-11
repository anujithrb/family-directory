"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const family_members_controller_1 = require("./family-members.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const env_1 = require("../../config/env");
const router = (0, express_1.Router)();
const controller = new family_members_controller_1.FamilyMembersController();
const storage = multer_1.default.diskStorage({
    destination: env_1.env.UPLOAD_DIR,
    filename: (_req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: env_1.env.MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        if (allowed.test(path_1.default.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    },
});
router.get('/', auth_middleware_1.authenticate, controller.getMembers);
router.get('/:id', auth_middleware_1.authenticate, controller.getMember);
router.post('/', auth_middleware_1.authenticate, controller.createMember);
router.patch('/:id', auth_middleware_1.authenticate, controller.updateMember);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), controller.deleteMember);
router.post('/:id/photo', auth_middleware_1.authenticate, upload.single('photo'), controller.uploadPhoto);
exports.default = router;
//# sourceMappingURL=family-members.routes.js.map