import { Hono } from 'hono';
import { authMiddleware, AuthContext } from '../middleware/auth.middleware.js';
import { findUserById, findAllUsers, updateUserApproval, updateUserLimit } from '../db/queries/users.queries.js';
import { ForbiddenError, NotFoundError } from '../lib/errors.js';

const adminRoutes = new Hono<AuthContext>();

// Apply authentication middleware
adminRoutes.use('*', authMiddleware);

// Apply admin role verification middleware
adminRoutes.use('*', async (c, next) => {
  const userPayload = c.get('user');
  const user = await findUserById(userPayload.userId);
  if (!user || user.role !== 'admin') {
    throw new ForbiddenError('Administrator privilege required for this action.');
  }
  await next();
});

// GET /api/admin/users - List all users
adminRoutes.get('/users', async (c) => {
  const users = await findAllUsers();
  const sanitized = users.map(({ password_hash, ...u }) => u);
  return c.json({ users: sanitized }, 200);
});

// POST /api/admin/users/:id/approve - Approve user
adminRoutes.post('/users/:id/approve', async (c) => {
  const id = c.req.param('id');
  const user = await updateUserApproval(id, true);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  const { password_hash, ...sanitized } = user;
  return c.json({ user: sanitized }, 200);
});

// POST /api/admin/users/:id/disapprove - Disapprove user
adminRoutes.post('/users/:id/disapprove', async (c) => {
  const id = c.req.param('id');
  
  // Protect self-revocation
  const self = c.get('user');
  if (self.userId === id) {
    throw new ForbiddenError('Cannot revoke your own admin approval status.');
  }

  const user = await updateUserApproval(id, false);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  const { password_hash, ...sanitized } = user;
  return c.json({ user: sanitized }, 200);
});

// PATCH /api/admin/users/:id/limit - Set or clear a user's monthly request limit
adminRoutes.patch('/users/:id/limit', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{ monthly_limit: number | null }>();

  // Validate: must be a positive integer or null
  const limit = body.monthly_limit;
  if (limit !== null && (typeof limit !== 'number' || !Number.isInteger(limit) || limit <= 0)) {
    return c.json({ error: { message: 'monthly_limit must be a positive integer or null.' } }, 400);
  }

  const user = await updateUserLimit(id, limit);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  const { password_hash, ...sanitized } = user;
  return c.json({ user: sanitized }, 200);
});

export default adminRoutes;
