import { Context, Next } from 'hono';
import { verifyAccessToken } from '../services/auth.service.js';
import { UnauthorizedError } from '../lib/errors.js';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);
  
  c.set('user', payload);
  await next();
}
export type AuthContext = {
  Variables: {
    user: {
      userId: string;
      email: string;
    };
  };
};
