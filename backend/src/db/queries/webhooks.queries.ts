import { query } from '../../config/db.js';

export interface WebhookRow {
  id: string;
  user_id: string;
  url: string;
  signing_secret: string;
  is_active: boolean;
  created_at: Date;
}

export interface WebhookLogRow {
  id: string;
  webhook_id: string;
  order_id: string | null;
  event_type: string;
  payload: any;
  http_status: number | null;
  response_body: string | null;
  response_time_ms: number | null;
  attempt_count: number;
  delivered_at: Date | null;
  created_at: Date;
}

export async function getWebhookByUserId(userId: string): Promise<WebhookRow | null> {
  const sql = `SELECT * FROM webhooks WHERE user_id = $1;`;
  const result = await query(sql, [userId]);
  return result.rows[0] || null;
}

export async function createWebhook(userId: string, url: string, signingSecret: string): Promise<WebhookRow> {
  // Delete any existing webhooks first since it's 1 per user for now
  await query(`DELETE FROM webhooks WHERE user_id = $1;`, [userId]);

  const sql = `
    INSERT INTO webhooks (user_id, url, signing_secret)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await query(sql, [userId, url, signingSecret]);
  return result.rows[0];
}

export async function updateWebhook(id: string, userId: string, url: string, isActive: boolean): Promise<WebhookRow | null> {
  const sql = `
    UPDATE webhooks
    SET url = $3, is_active = $4
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  const result = await query(sql, [id, userId, url, isActive]);
  return result.rows[0] || null;
}

export async function deleteWebhook(id: string, userId: string): Promise<boolean> {
  const sql = `DELETE FROM webhooks WHERE id = $1 AND user_id = $2;`;
  const result = await query(sql, [id, userId]);
  return (result.rowCount ?? 0) > 0;
}

export async function createWebhookLog(params: {
  webhookId: string;
  orderId?: string | null;
  eventType: string;
  payload: any;
  httpStatus?: number | null;
  responseBody?: string | null;
  responseTimeMs?: number | null;
  attemptCount?: number;
  deliveredAt?: Date | null;
}): Promise<WebhookLogRow> {
  const sql = `
    INSERT INTO webhook_logs (
      webhook_id, order_id, event_type, payload, 
      http_status, response_body, response_time_ms, attempt_count, delivered_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
  const result = await query(sql, [
    params.webhookId,
    params.orderId || null,
    params.eventType,
    JSON.stringify(params.payload),
    params.httpStatus || null,
    params.responseBody || null,
    params.responseTimeMs || null,
    params.attemptCount || 1,
    params.deliveredAt || null
  ]);
  return result.rows[0];
}

export async function findWebhookLogs(
  webhookId: string,
  page = 1,
  limit = 10
): Promise<{ logs: WebhookLogRow[]; total: number }> {
  const offset = (page - 1) * limit;

  const countSql = `SELECT COUNT(*)::int FROM webhook_logs WHERE webhook_id = $1;`;
  const countResult = await query(countSql, [webhookId]);
  const total = countResult.rows[0].count;

  const sql = `
    SELECT * FROM webhook_logs 
    WHERE webhook_id = $1 
    ORDER BY created_at DESC 
    LIMIT $2 OFFSET $3;
  `;
  const result = await query(sql, [webhookId, limit, offset]);
  return {
    logs: result.rows,
    total
  };
}

export async function findWebhookLogById(logId: string): Promise<WebhookLogRow | null> {
  const sql = `SELECT * FROM webhook_logs WHERE id = $1;`;
  const result = await query(sql, [logId]);
  return result.rows[0] || null;
}

export async function updateWebhookLog(
  logId: string,
  params: {
    httpStatus: number | null;
    responseBody: string | null;
    responseTimeMs: number | null;
    attemptCount: number;
    deliveredAt: Date | null;
  }
): Promise<WebhookLogRow | null> {
  const sql = `
    UPDATE webhook_logs
    SET http_status = $2, response_body = $3, response_time_ms = $4, attempt_count = $5, delivered_at = $6
    WHERE id = $1
    RETURNING *;
  `;
  const result = await query(sql, [
    logId,
    params.httpStatus,
    params.responseBody,
    params.responseTimeMs,
    params.attemptCount,
    params.deliveredAt
  ]);
  return result.rows[0] || null;
}
