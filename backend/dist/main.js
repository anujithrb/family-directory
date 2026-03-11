"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const logger_middleware_1 = require("./middleware/logger.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const health_routes_1 = __importDefault(require("./modules/health/health.routes"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const users_routes_1 = __importDefault(require("./modules/users/users.routes"));
const family_members_routes_1 = __importDefault(require("./modules/family-members/family-members.routes"));
const relationships_routes_1 = __importDefault(require("./modules/relationships/relationships.routes"));
const family_tree_routes_1 = __importDefault(require("./modules/family-tree/family-tree.routes"));
const events_routes_1 = __importDefault(require("./modules/events/events.routes"));
const files_routes_1 = __importDefault(require("./modules/files/files.routes"));
// Ensure upload directory exists
const uploadDir = path_1.default.resolve(env_1.env.UPLOAD_DIR);
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// CORS
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, compression_1.default)());
// Request logging
app.use(logger_middleware_1.requestLogger);
// Swagger setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Family Directory API',
            version: '1.0.0',
            description: 'API for the Family Directory application',
        },
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ BearerAuth: [] }],
    },
    apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use(`${env_1.env.API_PREFIX}/docs`, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
app.get(`${env_1.env.API_PREFIX}/docs.json`, (_req, res) => res.json(swaggerSpec));
// Routes
app.use(`${env_1.env.API_PREFIX}/health`, health_routes_1.default);
app.use(`${env_1.env.API_PREFIX}/auth`, auth_routes_1.default);
app.use(`${env_1.env.API_PREFIX}/users`, users_routes_1.default);
app.use(`${env_1.env.API_PREFIX}/family-members`, family_members_routes_1.default);
app.use(`${env_1.env.API_PREFIX}/relationships`, relationships_routes_1.default);
app.use(`${env_1.env.API_PREFIX}/family-tree`, family_tree_routes_1.default);
app.use(`${env_1.env.API_PREFIX}/events`, events_routes_1.default);
app.use(`${env_1.env.API_PREFIX}/files`, files_routes_1.default);
// Error handling
app.use(error_middleware_1.errorHandler);
app.listen(env_1.env.PORT, () => {
    logger_1.logger.info(`Server running on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode`);
    logger_1.logger.info(`Swagger UI: http://localhost:${env_1.env.PORT}${env_1.env.API_PREFIX}/docs`);
});
exports.default = app;
//# sourceMappingURL=main.js.map