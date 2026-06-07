import crypto from 'crypto';
import * as webhookQueries from '../db/queries/webhooks.queries.js';
import { getWebhookQueue } from '../queues/webhookQueue.js';

export async function createWebhook(userId: string, url: string) {
  // Generate random 32-byte hex signing secret
  const signingSecret = crypto.randomBytes(32).toString('hex');
  return webhookQueries.createWebhook(userId, url, signingSecret);
}

export async function getWebhook(userId: string) {
  return webhookQueries.getWebhookByUserId(userId);
}

export async function updateWebhook(id: string, userId: string, url: string, isActive: boolean) {
  return webhookQueries.updateWebhook(id, userId, url, isActive);
}

export async function deleteWebhook(id: string, userId: string) {
  return webhookQueries.deleteWebhook(id, userId);
}

export async function getWebhookLogs(webhookId: string, page = 1, limit = 10) {
  return webhookQueries.findWebhookLogs(webhookId, page, limit);
}

export async function triggerOrderWebhook(
  userId: string,
  order: {
    id: string;
    partner_order_id: string | null;
    status: string;
    product_id: string;
    quantity: number;
    amount: number | string | null;
    created_at: Date;
  }
) {
  const webhook = await webhookQueries.getWebhookByUserId(userId);
  if (!webhook || !webhook.is_active) {
    return;
  }

  const eventType = `order.${order.status}`;
  const payload = {
    event: eventType,
    order_id: order.id,
    partner_order_id: order.partner_order_id,
    status: order.status,
    product_id: order.product_id,
    quantity: order.quantity,
    amount: order.amount,
    timestamp: new Date().toISOString()
  };

  // Create initial log in database with status pending / attempt 1
  const log = await webhookQueries.createWebhookLog({
    webhookId: webhook.id,
    orderId: order.id,
    eventType,
    payload,
    attemptCount: 1
  });

  const queue = getWebhookQueue();
  // Add delivery job to BullMQ Webhook queue
  if (queue) {
    await queue.add(`deliver:${log.id}`, {
      webhookLogId: log.id,
      url: webhook.url,
      secret: webhook.signing_secret,
      payload
    }, {
      attempts: 10,
      backoff: {
        type: 'fixed',
        delay: 60000 // Retry every 1 minute
      }
    });
  } else {
    // Fail-safe fallback if Queue isn't initialized: execute direct deliver async
    deliverWebhookDirectly(log.id, webhook.url, webhook.signing_secret, payload).catch(err => {
      console.error('Failed direct webhook delivery fallback:', err);
    });
  }
}

export async function resendWebhook(logId: string) {
  const log = await webhookQueries.findWebhookLogById(logId);
  if (!log) {
    throw new Error('Webhook log not found');
  }

  const webhook = await webhookQueries.findWebhookLogById(log.webhook_id); // Wait, this gets log, we need webhook
  const sql = `SELECT * FROM webhooks WHERE id = $1;`;
  const db = await import('../config/db.js');
  const result = await db.query(sql, [log.webhook_id]);
  const activeWebhook = result.rows[0];

  if (!activeWebhook) {
    throw new Error('Webhook endpoint configuration not found or deleted');
  }

  const queue = getWebhookQueue();
  if (queue) {
    await queue.add(`resend:${log.id}`, {
      webhookLogId: log.id,
      url: activeWebhook.url,
      secret: activeWebhook.signing_secret,
      payload: log.payload
    });
  } else {
    deliverWebhookDirectly(log.id, activeWebhook.url, activeWebhook.signing_secret, log.payload).catch(err => {
      console.error('Failed direct webhook resend fallback:', err);
    });
  }
}

// Fallback direct execution
export async function deliverWebhookDirectly(logId: string, url: string, secret: string, payload: any) {
  const startTime = Date.now();
  const payloadStr = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');

  let httpStatus = 0;
  let responseBody = '';
  let delivered = false;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GoldBridge-Signature': signature
      },
      body: payloadStr,
      signal: AbortSignal.timeout(10000) // 10s timeout
    });

    httpStatus = res.status;
    responseBody = await res.text();
    delivered = res.ok;
  } catch (err: any) {
    responseBody = err.message || 'Network Timeout';
  }

  const responseTimeMs = Date.now() - startTime;

  await webhookQueries.updateWebhookLog(logId, {
    httpStatus,
    responseBody: responseBody.slice(0, 1000), // Trim long responses
    responseTimeMs,
    attemptCount: 1,
    deliveredAt: delivered ? new Date() : null
  });

  return delivered;
}
