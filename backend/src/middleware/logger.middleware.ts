import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);

  const start = Date.now();

  res.on('finish', () => {
    logger.info('HTTP Request', {
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
