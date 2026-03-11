"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = healthCheck;
const prisma_1 = require("../../config/prisma");
const redis_1 = require("../../config/redis");
const logger_1 = require("../../config/logger");
/**
 * Health check controller - checks DB and Redis connectivity
 */
async function healthCheck(req, res) {
    const checks = {};
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        checks.database = 'ok';
    }
    catch {
        checks.database = 'error';
        logger_1.logger.error('Database health check failed');
    }
    try {
        await redis_1.redis.ping();
        checks.redis = 'ok';
    }
    catch {
        checks.redis = 'error';
        logger_1.logger.error('Redis health check failed');
    }
    const allOk = Object.values(checks).every((v) => v === 'ok');
    res.status(allOk ? 200 : 503).json({
        status: allOk ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        checks,
    });
}
//# sourceMappingURL=health.controller.js.map