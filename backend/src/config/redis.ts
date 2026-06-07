import { Redis } from 'ioredis';
import { EventEmitter } from 'events';
import { env } from './env.js';

export class MockRedis extends EventEmitter {
  private store = new Map<string, any>();
  
  status = 'ready';

  async get(key: string) {
    return this.store.get(key) || null;
  }
  
  async setex(key: string, ttl: number, val: string) {
    this.store.set(key, val);
    setTimeout(() => this.store.delete(key), ttl * 1000);
    return 'OK';
  }
  
  async del(key: string) {
    return this.store.delete(key) ? 1 : 0;
  }
  
  async expire(key: string, ttl: number) {
    if (this.store.has(key)) {
      setTimeout(() => this.store.delete(key), ttl * 1000);
      return 1;
    }
    return 0;
  }
  
  async hincrby(key: string, field: string, increment: number) {
    if (!this.store.has(key)) {
      this.store.set(key, new Map<string, string>());
    }
    const map = this.store.get(key);
    const current = parseInt(map.get(field) || '0', 10);
    const next = current + increment;
    map.set(field, next.toString());
    return next;
  }
  
  async hgetall(key: string) {
    const map = this.store.get(key);
    if (!map) return {};
    const obj: Record<string, string> = {};
    if (map instanceof Map) {
      for (const [k, v] of map.entries()) {
        obj[k] = v;
      }
    }
    return obj;
  }
  
  // Zset operations for sliding window rate limiting
  async zremrangebyscore(key: string, min: number, max: number) {
    if (!this.store.has(key)) return 0;
    const list = this.store.get(key) as { member: string; score: number }[];
    const filtered = list.filter(item => item.score < min || item.score > max);
    const removedCount = list.length - filtered.length;
    this.store.set(key, filtered);
    return removedCount;
  }
  
  async zcard(key: string) {
    if (!this.store.has(key)) return 0;
    return (this.store.get(key) as any[]).length;
  }
  
  async zadd(key: string, score: number, member: string) {
    if (!this.store.has(key)) {
      this.store.set(key, []);
    }
    const list = this.store.get(key) as { member: string; score: number }[];
    list.push({ member, score });
    return 1;
  }

  async ping() {
    return 'PONG';
  }

  async quit() {
    return 'OK';
  }
}

export let isRedisMocked = false;
export let redis: any;

const initializeRedis = () => {
  try {
    const client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      connectTimeout: 2000,
      enableOfflineQueue: true,
      retryStrategy(times) {
        if (times > 1) {
          console.warn('⚠️ Local Redis server is unreachable. Swapped connection to in-memory fallback client.');
          isRedisMocked = true;
          // Dynamically patch ioredis client with MockRedis implementation
          const mock = new MockRedis();
          Object.getOwnPropertyNames(MockRedis.prototype).forEach(prop => {
            if (prop !== 'constructor') {
              (client as any)[prop] = (mock as any)[prop].bind(mock);
            }
          });
          client.emit('connect');
          return null; // Stop reconnection retries
        }
        return 1000;
      }
    });

    client.on('connect', () => {
      if (!isRedisMocked) {
        console.log('Connected to local Redis server.');
      }
    });

    client.on('error', (err) => {
      if (!isRedisMocked) {
        console.error('Redis Client connection issue:', err.message);
      }
    });

    return client;
  } catch (error) {
    console.warn('⚠️ Initialization of Redis Client failed. Loading in-memory MockRedis.');
    isRedisMocked = true;
    return new MockRedis();
  }
};

redis = initializeRedis();
