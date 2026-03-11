"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
// Logger import is deferred to avoid circular dependency (logger → env → redis)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const getLogger = () => require('./logger').logger;
exports.redis = new ioredis_1.default(env_1.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});
exports.redis.on('error', (err) => {
    getLogger().error('Redis connection error:', { error: err.message });
});
exports.redis.on('connect', () => {
    getLogger().info('Redis connected');
});
//# sourceMappingURL=redis.js.map