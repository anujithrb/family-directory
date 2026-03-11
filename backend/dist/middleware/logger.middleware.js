"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const uuid_1 = require("uuid");
const logger_1 = require("../config/logger");
function requestLogger(req, res, next) {
    const requestId = req.headers['x-request-id'] || (0, uuid_1.v4)();
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    const start = Date.now();
    res.on('finish', () => {
        logger_1.logger.info('HTTP Request', {
            requestId,
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${Date.now() - start}ms`,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
    });
    next();
}
//# sourceMappingURL=logger.middleware.js.map