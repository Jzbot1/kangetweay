import { Hono } from 'hono';
import * as apiKeyService from '../services/apiKey.service.js';
import { authMiddleware, AuthContext } from '../middleware/auth.middleware.js';
import { BadRequestError } from '../lib/errors.js';
import { z } from 'zod';

const apiKeysRoutes = new Hono<AuthContext>();

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
  environment: z.enum(['uat', 'production']),
  ipAllowlist: z.array(z.string()).nullable().optional()
});

apiKeysRoutes.use('*', authMiddleware);

apiKeysRoutes.get('/', async (c) => {
  const user = c.get('user');
  const keys = await apiKeyService.listKeys(user.userId);
  return c.json({ keys }, 200);
});

apiKeysRoutes.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = createKeySchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError('Invalid input parameters');
  }

  const result = await apiKeyService.createKey(
    user.userId,
    parsed.data.name,
    parsed.data.environment,
    parsed.data.ipAllowlist
  );
  return c.json(result, 201);
});

apiKeysRoutes.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  
  const success = await apiKeyService.deleteKey(id, user.userId);
  if (!success) {
    throw new BadRequestError('API key not found or could not be deleted');
  }
  return c.body(null, 204);
});

apiKeysRoutes.patch('/:id/revoke', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const revokedKey = await apiKeyService.revokeKey(id, user.userId);
  if (!revokedKey) {
    throw new BadRequestError('API key not found or could not be revoked');
  }

  return c.json({ key: revokedKey }, 200);
});

export default apiKeysRoutes;
