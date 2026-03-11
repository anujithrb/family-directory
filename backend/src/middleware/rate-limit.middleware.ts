import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Global API rate limiter — applied to all routes.
 * Auth routes have a stricter separate limiter.
 */
export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 1000,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/api/docs'),
});
