import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { redis } from '../../config/redis';
import { logger } from '../../config/logger';

/**
 * Health check controller - checks DB and Redis connectivity
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  const checks: Record<string, 'ok' | 'error'> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
    logger.error('Database health check failed');
  }

  try {
    await redis.ping();
    checks.redis = 'ok';
  } catch {
    checks.redis = 'error';
    logger.error('Redis health check failed');
  }

  const allOk = Object.values(checks).every((v) => v === 'ok');
  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
}
