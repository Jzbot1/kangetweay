import { Hono } from 'hono';
import * as authService from '../services/auth.service.js';
import { authMiddleware, AuthContext } from '../middleware/auth.middleware.js';
import { findUserById } from '../db/queries/users.queries.js';
import { BadRequestError } from '../lib/errors.js';
import { z } from 'zod';

const authRoutes = new Hono<AuthContext>();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

authRoutes.post('/register', async (c) => {
  const body = await c.req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError('Invalid input parameters');
  }

  const result = await authService.register(parsed.data.name, parsed.data.email, parsed.data.password);
  return c.json(result, 201);
});

authRoutes.post('/login', async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError('Invalid input parameters');
  }

  const result = await authService.login(parsed.data.email, parsed.data.password);
  return c.json(result, 200);
});

authRoutes.post('/refresh', async (c) => {
  const body = await c.req.json();
  const refreshToken = body?.refreshToken;
  if (!refreshToken) {
    throw new BadRequestError('Missing refresh token');
  }

  const result = await authService.refresh(refreshToken);
  return c.json(result, 200);
});

authRoutes.post('/logout', (c) => {
  // Stateless JWT logout - simply return 204
  return c.body(null, 204);
});

authRoutes.get('/me', authMiddleware, async (c) => {
  const userPayload = c.get('user');
  const user = await findUserById(userPayload.userId);
  if (!user) {
    throw new BadRequestError('User not found');
  }
  
  const { password_hash, ...userWithoutPassword } = user;
  return c.json({ user: userWithoutPassword }, 200);
});

export default authRoutes;
