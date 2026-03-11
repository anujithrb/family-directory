import Redis from 'ioredis';
import { env } from './env';

// Logger import is deferred to avoid circular dependency (logger → env → redis)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const getLogger = () => require('./logger').logger as import('winston').Logger;

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  getLogger().error('Redis connection error:', { error: (err as Error).message });
});

redis.on('connect', () => {
  getLogger().info('Redis connected');
});
