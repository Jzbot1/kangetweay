import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import crypto from 'crypto';
import * as webhookQueries from '../db/queries/webhooks.queries.js';

export function startWebhookWorker() {
  const worker = new Worker(
    'webhookQueue',
    async (job: Job) => {
      const { webhookLogId, url, secret, payload } = job.data;
      console.log(`[WebhookWorker] Delivering webhook log ${webhookLogId} to ${url}`);

      const startTime = Date.now();
      const payloadStr = JSON.stringify(payload);
      
      // Sign payload: X-GoldBridge-Signature: HMAC-SHA256(JSON.stringify(payload), signingSecret)
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
      const attemptCount = (job.attemptsMade || 0) + 1;

      // Update delivery log in DB
      await webhookQueries.updateWebhookLog(webhookLogId, {
        httpStatus,
        responseBody: responseBody.slice(0, 1000), // Trim long responses
        responseTimeMs,
        attemptCount,
        deliveredAt: delivered ? new Date() : null
      });

      if (!delivered) {
        throw new Error(`Webhook delivery failed with status ${httpStatus}`);
      }
    },
    {
      connection: redis,
      concurrency: 10
    }
  );

  worker.on('completed', (job) => {
    console.log(`[WebhookWorker] Webhook job ${job.id} delivered successfully`);
  });

  worker.on('failed', (job, err) => {
    console.warn(`[WebhookWorker] Webhook job ${job?.id} attempt failed:`, err.message);
  });
}
