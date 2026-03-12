import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import fs from 'fs';

import { env } from './config/env';
import { logger } from './config/logger';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';
import { globalRateLimiter } from './middleware/rate-limit.middleware';
import { csrfProtection } from './middleware/csrf.middleware';

import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import familyMembersRoutes from './modules/family-members/family-members.routes';
import relationshipsRoutes from './modules/relationships/relationships.routes';
import familyTreeRoutes from './modules/family-tree/family-tree.routes';
import eventsRoutes from './modules/events/events.routes';
import filesRoutes from './modules/files/files.routes';

// Ensure upload directory exists
const uploadDir = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-XSRF-TOKEN'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression() as express.RequestHandler);

// Request logging
app.use(requestLogger);

// Global rate limiting
app.use(globalRateLimiter);

// CSRF protection for all state-changing requests
app.use(csrfProtection);

// Swagger setup
const swaggerOptions: swaggerJsdoc.Options = {
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

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(`${env.API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get(`${env.API_PREFIX}/docs.json`, (_req, res) => res.json(swaggerSpec));

// Routes
app.use(`${env.API_PREFIX}/health`, healthRoutes);
app.use(`${env.API_PREFIX}/auth`, authRoutes);
app.use(`${env.API_PREFIX}/users`, usersRoutes);
app.use(`${env.API_PREFIX}/family-members`, familyMembersRoutes);
app.use(`${env.API_PREFIX}/relationships`, relationshipsRoutes);
app.use(`${env.API_PREFIX}/family-tree`, familyTreeRoutes);
app.use(`${env.API_PREFIX}/events`, eventsRoutes);
app.use(`${env.API_PREFIX}/files`, filesRoutes);

// Error handling
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  logger.info(`Swagger UI: http://localhost:${env.PORT}${env.API_PREFIX}/docs`);
});

export default app;
