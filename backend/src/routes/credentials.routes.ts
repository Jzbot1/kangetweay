import { Hono } from 'hono';
import * as credentialService from '../services/credential.service.js';
import { authMiddleware, AuthContext } from '../middleware/auth.middleware.js';
import { BadRequestError } from '../lib/errors.js';
import { z } from 'zod';

const credentialsRoutes = new Hono<AuthContext>();

const createCredSchema = z.object({
  label: z.string().min(1).max(100),
  partnerId: z.string().min(1),
  secretKey: z.string().min(1),
  environment: z.enum(['uat', 'production'])
});

const updateCredSchema = z.object({
  label: z.string().min(1).max(100),
  partnerId: z.string().min(1),
  secretKey: z.string().optional(),
  environment: z.enum(['uat', 'production'])
});

credentialsRoutes.use('*', authMiddleware);

credentialsRoutes.get('/', async (c) => {
  const user = c.get('user');
  const credentials = await credentialService.listCredentials(user.userId);
  return c.json({ credentials }, 200);
});

credentialsRoutes.get('/balances', async (c) => {
  const user = c.get('user');
  const balances = await credentialService.getBalances(user.userId);
  return c.json({ balances }, 200);
});

credentialsRoutes.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = createCredSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError('Invalid input parameters');
  }

  const credential = await credentialService.createCredential({
    userId: user.userId,
    label: parsed.data.label,
    partnerId: parsed.data.partnerId,
    secretKey: parsed.data.secretKey,
    environment: parsed.data.environment
  });

  return c.json({ credential }, 201);
});

credentialsRoutes.put('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateCredSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError('Invalid input parameters');
  }

  const credential = await credentialService.updateCredential(id, user.userId, {
    label: parsed.data.label,
    partnerId: parsed.data.partnerId,
    secretKey: parsed.data.secretKey,
    environment: parsed.data.environment
  });

  if (!credential) {
    throw new BadRequestError('Credential not found or could not be updated');
  }

  return c.json({ credential }, 200);
});

credentialsRoutes.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const success = await credentialService.deleteCredential(id, user.userId);
  if (!success) {
    throw new BadRequestError('Credential not found or could not be deleted');
  }

  return c.body(null, 204);
});

credentialsRoutes.post('/test', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { id, partnerId, secretKey, environment } = body;

  let cred;
  if (id && !secretKey) {
    cred = await credentialService.getCredentialForUse(id, user.userId);
  } else {
    cred = {
      partnerId,
      secretKey,
      environment
    };
  }

  if (!cred || !cred.partnerId || !cred.secretKey) {
    throw new BadRequestError('Invalid credentials. Partner ID and Secret Key are required.');
  }

  const result = await credentialService.testConnectionDirect(cred as any);
  return c.json(result, 200);
});

credentialsRoutes.post('/:id/test', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const result = await credentialService.testConnection(id, user.userId);
  return c.json(result, 200);
});

credentialsRoutes.patch('/:id/set-default', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const credential = await credentialService.setDefault(id, user.userId);
  if (!credential) {
    throw new BadRequestError('Credential not found');
  }

  return c.json({ credential }, 200);
});

export default credentialsRoutes;
