import { query } from '../config/db.js';
import { redis } from '../config/redis.js';

export async function recordRequest(params: {
  userId: string;
  apiKeyId: string | null;
  path: string;
  isSuccess: boolean;
}) {
  const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const successVal = params.isSuccess ? 1 : 0;
  const failedVal = params.isSuccess ? 0 : 1;

  try {
    // 1. Log to Postgres database
    const sql = `
      INSERT INTO usage_daily (user_id, api_key_id, date, total_requests, successful_requests, failed_requests)
      VALUES ($1, $2, $3, 1, $4, $5)
      ON CONFLICT (user_id, api_key_id, date)
      DO UPDATE SET
        total_requests = usage_daily.total_requests + 1,
        successful_requests = usage_daily.successful_requests + $4,
        failed_requests = usage_daily.failed_requests + $5;
    `;
    await query(sql, [params.userId, params.apiKeyId || null, dateStr, successVal, failedVal]);

    // 2. Increment Redis counters for real-time displays
    const dayKey = `usage:day:${dateStr}:${params.userId}`;
    await redis.hincrby(dayKey, 'total', 1);
    await redis.hincrby(dayKey, params.isSuccess ? 'success' : 'failed', 1);
    await redis.expire(dayKey, 86400 * 2); // Keep for 2 days

    // Endpoint counters
    const endpointHashKey = `usage:endpoints:${params.userId}`;
    await redis.hincrby(endpointHashKey, params.path, 1);
  } catch (error) {
    console.error('Failed to record usage stats:', error);
  }
}

export async function getUsageStats(userId: string, period: '7d' | '30d' | '90d' = '7d') {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  
  // Calculate date range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get aggregated stats from DB
  const sql = `
    SELECT 
      SUM(total_requests)::int as total_requests,
      SUM(successful_requests)::int as successful_requests,
      SUM(failed_requests)::int as failed_requests
    FROM usage_daily
    WHERE user_id = $1 AND date >= $2;
  `;
  
  const result = await query(sql, [userId, startDate.toISOString().split('T')[0]]);
  const stats = result.rows[0];

  const totalRequests = stats.total_requests || 0;
  const successRequests = stats.successful_requests || 0;
  const successRate = totalRequests > 0 ? Math.round((successRequests / totalRequests) * 100) : 100;

  // Real-time queries for today using Redis
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRedis = await redis.hgetall(`usage:day:${todayStr}:${userId}`);
  const callsToday = parseInt(todayRedis.total || '0', 10);

  // Count active API keys from DB
  const keySql = `SELECT COUNT(*)::int FROM api_keys WHERE user_id = $1 AND is_active = true;`;
  const keyResult = await query(keySql, [userId]);
  const activeKeys = keyResult.rows[0].count || 0;

  return {
    totalRequests,
    successRate,
    callsToday,
    activeKeys
  };
}

export async function getUsageChart(userId: string, period: '7d' | '30d' | '90d' = '7d') {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const sql = `
    SELECT 
      TO_CHAR(date, 'YYYY-MM-DD') as date,
      SUM(total_requests)::int as requests,
      SUM(successful_requests)::int as success,
      SUM(failed_requests)::int as failed
    FROM usage_daily
    WHERE user_id = $1 AND date >= $2
    GROUP BY date
    ORDER BY date ASC;
  `;

  const result = await query(sql, [userId, startDate.toISOString().split('T')[0]]);
  return result.rows;
}

export async function getUsageByEndpoint(userId: string, period: '7d' | '30d' | '90d' = '7d') {
  // We can query endpoints from Redis. If Redis is empty, we fall back to a mock list, 
  // or track path logs. Since path logs are saved in Redis under `usage:endpoints:${userId}`
  const endpointHashKey = `usage:endpoints:${userId}`;
  const redisEndpoints = await redis.hgetall(endpointHashKey);
  
  const endpoints = Object.keys(redisEndpoints).map(path => ({
    path,
    count: parseInt(redisEndpoints[path], 10)
  }));

  if (endpoints.length === 0) {
    // Return sample endpoints if no traffic yet
    return [
      { path: '/v1/order/create', count: 0 },
      { path: '/v1/products', count: 0 },
      { path: '/v1/categories', count: 0 },
      { path: '/v1/order/:orderId', count: 0 }
    ];
  }

  // Sort descending
  return endpoints.sort((a, b) => b.count - a.count);
}

/**
 * Returns the current month's request usage vs the user's admin-set limit.
 * Period is always the current calendar month (1st to today).
 */
export async function getUserQuota(userId: string): Promise<{
  used: number;
  limit: number | null;
  period: 'monthly';
  resetDate: string;
}> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];

  // Sum all requests this calendar month from usage_daily
  const usageSql = `
    SELECT COALESCE(SUM(total_requests), 0)::int AS used
    FROM usage_daily
    WHERE user_id = $1 AND date >= $2;
  `;
  const usageResult = await query(usageSql, [userId, monthStart]);
  const used = usageResult.rows[0]?.used ?? 0;

  // Fetch the user's monthly_limit
  const userSql = `SELECT monthly_limit FROM users WHERE id = $1;`;
  const userResult = await query(userSql, [userId]);
  const limit: number | null = userResult.rows[0]?.monthly_limit ?? null;

  // First day of next month as reset date
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const resetDate = nextMonth.toISOString().split('T')[0];

  return { used, limit, period: 'monthly', resetDate };
}
