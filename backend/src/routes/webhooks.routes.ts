import { Hono } from 'hono';
import * as webhookService from '../services/webhook.service.js';
import { authMiddleware, AuthContext } from '../middleware/auth.middleware.js';
import { BadRequestError } from '../lib/errors.js';
import { z } from 'zod';

const webhooksRoutes = new Hono<AuthContext>();

const createWebhookSchema = z.object({
  url: z.string().url()
});

const updateWebhookSchema = z.object({
  url: z.string().url(),
  isActive: z.boolean()
});

webhooksRoutes.use('*', authMiddleware);

webhooksRoutes.get('/', async (c) => {
  const user = c.get('user');
  const webhook = await webhookService.getWebhook(user.userId);
  return c.json({ webhook }, 200);
});

webhooksRoutes.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = createWebhookSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError('Invalid input parameters');
  }

  const webhook = await webhookService.createWebhook(user.userId, parsed.data.url);
  return c.json({ webhook, signingSecret: webhook.signing_secret }, 201);
});

webhooksRoutes.put('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateWebhookSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError('Invalid input parameters');
  }

  const webhook = await webhookService.updateWebhook(id, user.userId, parsed.data.url, parsed.data.isActive);
  if (!webhook) {
    throw new BadRequestError('Webhook not found or could not be updated');
  }

  return c.json({ webhook }, 200);
});

webhooksRoutes.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const success = await webhookService.deleteWebhook(id, user.userId);
  if (!success) {
    throw new BadRequestError('Webhook not found or could not be deleted');
  }

  return c.body(null, 204);
});

webhooksRoutes.get('/:id/logs', async (c) => {
  const id = c.req.param('id');
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '10', 10);

  const { logs, total } = await webhookService.getWebhookLogs(id, page, limit);
  return c.json({ logs, total }, 200);
});

webhooksRoutes.post('/logs/:logId/resend', async (c) => {
  const logId = c.req.param('logId');
  
  try {
    await webhookService.resendWebhook(logId);
    return c.json({ success: true }, 200);
  } catch (error: any) {
    throw new BadRequestError(error.message || 'Webhook resend failed');
  }
});

export default webhooksRoutes;
