"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const env_1 = require("./env");
const { combine, timestamp, errors, json, colorize, simple } = winston_1.default.format;
exports.logger = winston_1.default.createLogger({
    level: env_1.env.LOG_LEVEL,
    format: combine(timestamp(), errors({ stack: true }), json()),
    transports: [
        new winston_1.default.transports.Console({
            format: env_1.env.NODE_ENV === 'development'
                ? combine(colorize(), simple())
                : combine(timestamp(), json()),
        }),
        new winston_daily_rotate_file_1.default({
            dirname: env_1.env.LOG_DIR,
            filename: 'app-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            maxSize: '20m',
        }),
    ],
});
//# sourceMappingURL=logger.js.map