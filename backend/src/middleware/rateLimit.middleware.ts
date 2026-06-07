import { Context, Next } from 'hono';
import { redis } from '../config/redis.js';
import { RateLimitError } from '../lib/errors.js';

export async function rateLimitMiddleware(c: Context, next: Next) {
  const apiKey = c.get('apiKey');
  const userId = apiKey ? apiKey.userId : c.get('user')?.userId;

  if (!userId) {
    // If not authenticated via JWT or API Key, skip rate limiting or limit by IP
    return next();
  }

  const limit = 100; // Max 100 requests per 60 seconds
  const windowMs = 60000;
  const now = Date.now();
  const windowStart = now - windowMs;
  const key = `ratelimit:${userId}`;

  try {
    // Clean up old requests outside sliding window
    await redis.zremrangebyscore(key, 0, windowStart);
    
    // Count requests in window
    const count = await redis.zcard(key);

    if (count >= limit) {
      throw new RateLimitError('Rate limit exceeded. Max 100 requests per minute.', 'RATE_LIMIT_EXCEEDED');
    }

    // Record this request
    const uniqueMember = `${now}:${Math.random().toString(36).substring(2, 7)}`;
    await redis.zadd(key, now, uniqueMember);
    await redis.expire(key, 65); // Expire key if inactive

  } catch (error: any) {
    if (error instanceof RateLimitError) throw error;
    console.error('Rate limit redis execution error:', error);
  }

  await next();
}
