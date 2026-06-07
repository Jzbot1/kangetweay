import { Context, Next } from 'hono';
import { ForbiddenError } from '../lib/errors.js';

export async function ipAllowlistMiddleware(c: Context, next: Next) {
  const apiKey = c.get('apiKey');

  if (!apiKey || !apiKey.ipAllowlist || apiKey.ipAllowlist.length === 0) {
    // No restriction
    return next();
  }

  // Retrieve client IP
  const forwardedFor = c.req.header('x-forwarded-for');
  const clientIp = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : c.req.header('x-real-ip') || '127.0.0.1';

  // Support local testing loopbacks
  const cleanIp = clientIp.replace(/^::ffff:/, ''); // Strip IPv6 translation if present

  const isAllowed = apiKey.ipAllowlist.some((ip: string) => {
    // Exact match
    if (ip === cleanIp) return true;
    
    // Support basic CIDR or wildcard matches (optional but nice)
    if (ip === '*' || ip === '0.0.0.0/0') return true;

    return false;
  });

  if (!isAllowed) {
    console.warn(`Blocked API request from IP: ${cleanIp}. Key requires allowlist: ${apiKey.ipAllowlist.join(', ')}`);
    throw new ForbiddenError(`IP address not allowed: ${cleanIp}`, 'IP_NOT_ALLOWED');
  }

  await next();
}
