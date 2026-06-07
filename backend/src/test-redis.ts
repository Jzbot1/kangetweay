import { Redis } from 'ioredis';

const redisUrl = "redis://localhost:6379";

async function main() {
  console.log('Connecting to local Redis...');
  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000
  });
  
  redis.on('error', (err) => {
    console.error('Redis connection test event error:', err.message);
    process.exit(1);
  });

  const ping = await redis.ping();
  console.log('Redis PING Response:', ping);
  await redis.quit();
}

main().catch(err => {
  console.error('Redis connection test failed:', err.message);
  process.exit(1);
});
