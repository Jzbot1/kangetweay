import { Queue } from 'bullmq';
import { redis, isRedisMocked } from '../config/redis.js';

let orderQueue: Queue | null = null;

export function getOrderQueue(): Queue | null {
  if (isRedisMocked) {
    return null;
  }
  if (!orderQueue) {
    try {
      orderQueue = new Queue('orderQueue', {
        connection: redis
      });
    } catch (e) {
      console.warn('Failed to build BullMQ Order Queue:', e);
      return null;
    }
  }
  return orderQueue;
}
