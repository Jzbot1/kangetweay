import { Hono } from 'hono';
import * as usageService from '../services/usage.service.js';
import { authMiddleware, AuthContext } from '../middleware/auth.middleware.js';

const usageRoutes = new Hono<AuthContext>();

usageRoutes.use('*', authMiddleware);

usageRoutes.get('/stats', async (c) => {
  const user = c.get('user');
  const period = (c.req.query('period') as '7d' | '30d' | '90d') || '7d';

  const stats = await usageService.getUsageStats(user.userId, period);
  return c.json(stats, 200);
});

usageRoutes.get('/chart', async (c) => {
  const user = c.get('user');
  const period = (c.req.query('period') as '7d' | '30d' | '90d') || '7d';

  const chart = await usageService.getUsageChart(user.userId, period);
  return c.json({ daily: chart }, 200);
});

usageRoutes.get('/by-endpoint', async (c) => {
  const user = c.get('user');
  const period = (c.req.query('period') as '7d' | '30d' | '90d') || '7d';

  const endpoints = await usageService.getUsageByEndpoint(user.userId, period);
  return c.json({ endpoints }, 200);
});

export default usageRoutes;
