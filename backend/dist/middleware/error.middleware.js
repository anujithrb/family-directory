"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const logger_1 = require("../config/logger");
const zod_1 = require("zod");
class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, code, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, _next) {
    const requestId = req.headers['x-request-id'];
    if (err instanceof AppError) {
        logger_1.logger.warn('Application error', { requestId, code: err.code, message: err.message });
        res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
            },
        });
        return;
    }
    if (err instanceof zod_1.ZodError) {
        logger_1.logger.warn('Validation error', { requestId, errors: err.errors });
        res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: err.errors,
            },
        });
        return;
    }
    logger_1.logger.error('Unhandled error', { requestId, error: err.message, stack: err.stack });
    res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
        },
    });
}
//# sourceMappingURL=error.middleware.js.map