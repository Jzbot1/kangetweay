import { Queue } from 'bullmq';
import { redis, isRedisMocked } from '../config/redis.js';

let webhookQueue: Queue | null = null;

export function getWebhookQueue(): Queue | null {
  if (isRedisMocked) {
    return null;
  }
  if (!webhookQueue) {
    try {
      webhookQueue = new Queue('webhookQueue', {
        connection: redis
      });
    } catch (e) {
      console.warn('Failed to build BullMQ Webhook Queue:', e);
      return null;
    }
  }
  return webhookQueue;
}
