import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from './config/env.js';
import { initDatabase } from './config/db.js';
import { isRedisMocked } from './config/redis.js';
import { errorHandler } from './lib/errors.js';
import { loggerMiddleware } from './middleware/logger.middleware.js';

import authRoutes from './routes/auth.routes.js';
import apiKeysRoutes from './routes/apiKeys.routes.js';
import credentialsRoutes from './routes/credentials.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import webhooksRoutes from './routes/webhooks.routes.js';
import usageRoutes from './routes/usage.routes.js';
import adminRoutes from './routes/admin.routes.js';
import gatewayRoutes from './routes/gateway.routes.js';
import moogoldCallbackRoutes from './routes/moogold.routes.js';

import { startOrderWorker } from './workers/orderWorker.js';
import { startWebhookWorker } from './workers/webhookWorker.js';

const app = new Hono();

// Middlewares
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600
}));

app.use('*', loggerMiddleware);

// Base Route
app.get('/', (c) => c.json({ name: 'jzgateway API Server', status: 'online' }));

// Register Routes
app.route('/api/auth', authRoutes);
app.route('/api/api-keys', apiKeysRoutes);
app.route('/api/credentials', credentialsRoutes);
app.route('/api/orders', ordersRoutes);
app.route('/api/webhooks', webhooksRoutes);
app.route('/api/usage', usageRoutes);
app.route('/api/admin', adminRoutes);

// API Gateway Proxy routes (v1 prefix)
app.route('/v1', gatewayRoutes);
app.route('/v1/webhook', moogoldCallbackRoutes);

// Error Handling
app.onError(errorHandler);

// App bootstrap
const start = async () => {
  try {
    // 1. Initialize Postgres Tables
    await initDatabase();

    // 2. Initialize BullMQ Workers
    if (!isRedisMocked) {
      startOrderWorker();
      startWebhookWorker();
      console.log('BullMQ Order and Webhook background workers started.');
    } else {
      console.log('BullMQ Workers bypassed (running in offline direct fallback mode).');
    }

    // 3. Start Hono node server
    const port = env.PORT;
    serve({
      fetch: app.fetch,
      port
    });
    console.log(`Server is running on http://localhost:${port}`);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
