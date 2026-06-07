import { Hono } from 'hono';
import { query } from '../config/db.js';
import * as orderServices from '../services/order.service.js';
import { triggerOrderWebhook } from '../services/webhook.service.js';

const moogoldCallbackRoutes = new Hono();

moogoldCallbackRoutes.post('/moogold-callback', async (c) => {
  const body = await c.req.json();
  console.log('[MooGoldCallback] Received callback payload:', JSON.stringify(body));

  const moogoldOrderId = body.order_id?.toString();
  const status = body.status; // e.g. completed, refunded, incorrect-details
  const message = body.message || `Status updated to ${status}`;

  if (!moogoldOrderId) {
    return c.json({ error: 'Missing order_id in callback payload' }, 400);
  }

  // 1. Locate order by MooGold order ID
  const result = await query(
    'SELECT * FROM orders WHERE moogold_order_id = $1 LIMIT 1;',
    [moogoldOrderId]
  );
  const order = result.rows[0];

  if (!order) {
    console.warn(`[MooGoldCallback] No order found matching moogold_order_id: ${moogoldOrderId}`);
    // Return 200/ok to MooGold to prevent repeated retries for untracked order
    return c.json({ status: 'ok', warning: 'Order not found' }, 200);
  }

  // 2. Validate status value to make sure it matches DB check constraint
  let dbStatus: 'completed' | 'refunded' | 'incorrect-details' | 'failed' | 'processing' | 'pending' = 'processing';
  
  if (status === 'completed') dbStatus = 'completed';
  else if (status === 'refunded') dbStatus = 'refunded';
  else if (status === 'incorrect-details') dbStatus = 'incorrect-details';
  else if (status === 'failed') dbStatus = 'failed';
  else if (status === 'processing') dbStatus = 'processing';

  // 3. Update status in database
  const updatedOrder = await orderServices.updateOrderStatus(order.id, dbStatus, {
    responsePayload: body,
    eventMessage: `MooGold Callback: ${message}`
  });

  // 4. Trigger client webhook
  if (updatedOrder) {
    await triggerOrderWebhook(order.user_id, updatedOrder);
  }

  return c.json({ status: 'ok' }, 200);
});

export default moogoldCallbackRoutes;
