import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import { env } from '../config/env';

/**
 * CSRF protection middleware using double-submit cookie pattern.
 * Compatible with Angular's built-in XSRF handling (HttpClientXsrfModule).
 *
 * Flow:
 * 1. On GET requests, set an XSRF-TOKEN cookie (readable by JS)
 * 2. On mutating requests, verify the X-XSRF-TOKEN header matches the cookie
 * 3. Bearer-token requests are also accepted (not CSRF-vulnerable)
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Skip in test environment
  if (env.NODE_ENV === 'test') {
    return next();
  }

  // On safe methods, ensure XSRF token cookie is set
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    if (!req.cookies['XSRF-TOKEN']) {
      const token = randomBytes(32).toString('hex');
      res.cookie('XSRF-TOKEN', token, {
        httpOnly: false, // Must be readable by JS
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });
    }
    return next();
  }

  // For state-changing methods: Bearer token endpoints are CSRF-safe
  if (req.headers['authorization']?.startsWith('Bearer ')) {
    return next();
  }

  // Verify double-submit CSRF token for cookie-based endpoints
  const cookieToken = req.cookies['XSRF-TOKEN'];
  const headerToken = req.headers['x-xsrf-token'] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({
      error: { code: 'CSRF_FORBIDDEN', message: 'CSRF token validation failed' },
    });
    return;
  }

  next();
}

