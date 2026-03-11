"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../../config/env");
const error_middleware_1 = require("../../middleware/error.middleware");
class FilesController {
    /**
     * Serve a file by filename
     */
    serveFile = (req, res, next) => {
        try {
            const filename = req.params.filename;
            // Prevent path traversal
            const safeName = path_1.default.basename(filename);
            const filePath = path_1.default.resolve(env_1.env.UPLOAD_DIR, safeName);
            if (!fs_1.default.existsSync(filePath)) {
                return next(new error_middleware_1.AppError(404, 'FILE_NOT_FOUND', 'File not found'));
            }
            res.sendFile(filePath);
        }
        catch (err) {
            next(err);
        }
    };
}
exports.FilesController = FilesController;
//# sourceMappingURL=files.controller.js.map