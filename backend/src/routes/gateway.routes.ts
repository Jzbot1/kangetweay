import { Hono } from 'hono';
import { apiKeyMiddleware, ApiKeyContext } from '../middleware/apiKey.middleware.js';
import { ipAllowlistMiddleware } from '../middleware/ipAllowlist.middleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware.js';
import * as orderServices from '../services/order.service.js';
import { getOrderQueue } from '../queues/orderQueue.js';
import * as usageService from '../services/usage.service.js';
import { findDefaultCredential } from '../db/queries/credentials.queries.js';
import { getCredentialForUse } from '../services/credential.service.js';
import { moogoldService } from '../services/moogold.service.js';
import { BadRequestError } from '../lib/errors.js';
import { z } from 'zod';

const gatewayRoutes = new Hono<ApiKeyContext>();

// Apply API Key security check, IP filter and rate limits to all gateway routes
gatewayRoutes.use('*', apiKeyMiddleware, ipAllowlistMiddleware, rateLimitMiddleware);

const createOrderSchema = z.object({
  partner_order_id: z.string().optional(),
  product_id: z.string(),
  category_id: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  fields: z.record(z.any()).default({})
});

gatewayRoutes.post('/order/create', async (c) => {
  const apiKey = c.get('apiKey');
  const body = await c.req.json();
  
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError('Invalid input parameters');
  }

  // Ensure user has default credential for the environment of this API key
  const defaultCred = await findDefaultCredential(apiKey.userId, apiKey.environment);
  if (!defaultCred) {
    throw new BadRequestError(`No default MooGold credential configured for the ${apiKey.environment} environment.`);
  }

  // Create order in DB with pending status
  const order = await orderServices.createOrder({
    userId: apiKey.userId,
    apiKeyId: apiKey.keyId,
    credentialId: defaultCred.id,
    partnerOrderId: parsed.data.partner_order_id,
    productId: parsed.data.product_id,
    categoryId: parsed.data.category_id,
    quantity: parsed.data.quantity,
    requestPayload: {
      category: parsed.data.category_id === 'eVouchers' ? 2 : 1, // mapped category
      'product-id': parseInt(parsed.data.product_id, 10),
      quantity: parsed.data.quantity,
      fields: parsed.data.fields
    }
  });

  let jobId = '';
  const queue = getOrderQueue();
  // Push order onto background processing queue
  if (queue) {
    const job = await queue.add(`process:${order.id}`, {
      orderId: order.id,
      userId: apiKey.userId,
      credentialId: defaultCred.id
    });
    jobId = job.id || '';
  } else {
    // Offline local in-memory direct execution
    console.log(`[Offline Mode] Processing order ${order.id} directly in-memory...`);
    const { processOrderInBackground } = await import('../workers/orderWorker.js');
    processOrderInBackground(order.id, apiKey.userId, defaultCred.id).catch((err: any) => {
      console.error('Failed inline background order processing:', err);
    });
    jobId = `inline_${order.id.substring(0, 8)}`;
  }

  // Record usage metrics
  await usageService.recordRequest({
    userId: apiKey.userId,
    apiKeyId: apiKey.keyId,
    path: '/v1/order/create',
    isSuccess: true
  });

  return c.json({
    jobId,
    orderId: order.id,
    status: 'queued'
  }, 202);
});

gatewayRoutes.get('/order/:orderId', async (c) => {
  const apiKey = c.get('apiKey');
  const orderId = c.req.param('orderId');

  const details = await orderServices.getOrderDetails(orderId, apiKey.userId);

  await usageService.recordRequest({
    userId: apiKey.userId,
    apiKeyId: apiKey.keyId,
    path: '/v1/order/:orderId',
    isSuccess: true
  });

  return c.json({ order: details.order }, 200);
});

gatewayRoutes.get('/order/by-partner/:partnerOrderId', async (c) => {
  const apiKey = c.get('apiKey');
  const partnerOrderId = c.req.param('partnerOrderId');

  const order = await orderServices.getOrderByPartnerId(partnerOrderId, apiKey.keyId);

  await usageService.recordRequest({
    userId: apiKey.userId,
    apiKeyId: apiKey.keyId,
    path: '/v1/order/by-partner/:partnerOrderId',
    isSuccess: true
  });

  return c.json({ order }, 200);
});

gatewayRoutes.get('/products', async (c) => {
  const apiKey = c.get('apiKey');
  const categoryId = parseInt(c.req.query('category_id') || '50', 10);

  const defaultCred = await findDefaultCredential(apiKey.userId, apiKey.environment);
  if (!defaultCred) {
    throw new BadRequestError(`No default MooGold credential configured for the ${apiKey.environment} environment.`);
  }

  const cred = await getCredentialForUse(defaultCred.id, apiKey.userId);
  if (!cred) throw new Error('Failed to load credentials');

  const products = await moogoldService.getProducts(cred, categoryId);

  await usageService.recordRequest({
    userId: apiKey.userId,
    apiKeyId: apiKey.keyId,
    path: '/v1/products',
    isSuccess: true
  });

  return c.json({ products }, 200);
});

gatewayRoutes.get('/products/:productId', async (c) => {
  const apiKey = c.get('apiKey');
  const productId = parseInt(c.req.param('productId'), 10);

  const defaultCred = await findDefaultCredential(apiKey.userId, apiKey.environment);
  if (!defaultCred) {
    throw new BadRequestError(`No default MooGold credential configured for the ${apiKey.environment} environment.`);
  }

  const cred = await getCredentialForUse(defaultCred.id, apiKey.userId);
  if (!cred) throw new Error('Failed to load credentials');

  const product = await moogoldService.getProductDetail(cred, productId);

  await usageService.recordRequest({
    userId: apiKey.userId,
    apiKeyId: apiKey.keyId,
    path: '/v1/products/:productId',
    isSuccess: true
  });

  return c.json({ product }, 200);
});

gatewayRoutes.get('/categories', async (c) => {
  const apiKey = c.get('apiKey');

  const defaultCred = await findDefaultCredential(apiKey.userId, apiKey.environment);
  if (!defaultCred) {
    throw new BadRequestError(`No default MooGold credential configured for the ${apiKey.environment} environment.`);
  }

  const cred = await getCredentialForUse(defaultCred.id, apiKey.userId);
  if (!cred) throw new Error('Failed to load credentials');

  const categories = await moogoldService.getCategories(cred);

  await usageService.recordRequest({
    userId: apiKey.userId,
    apiKeyId: apiKey.keyId,
    path: '/v1/categories',
    isSuccess: true
  });

  return c.json({ categories }, 200);
});

gatewayRoutes.get('/balance', async (c) => {
  const apiKey = c.get('apiKey');

  const defaultCred = await findDefaultCredential(apiKey.userId, apiKey.environment);
  if (!defaultCred) {
    throw new BadRequestError(`No default MooGold credential configured for the ${apiKey.environment} environment.`);
  }

  const cred = await getCredentialForUse(defaultCred.id, apiKey.userId);
  if (!cred) throw new Error('Failed to load credentials');

  const balanceInfo = await moogoldService.getUserBalance(cred);

  await usageService.recordRequest({
    userId: apiKey.userId,
    apiKeyId: apiKey.keyId,
    path: '/v1/balance',
    isSuccess: true
  });

  return c.json({
    balance: balanceInfo.balance,
    currency: balanceInfo.currency
  }, 200);
});

export default gatewayRoutes;
