import { query } from '../../config/db.js';

export interface OrderRow {
  id: string;
  user_id: string;
  api_key_id: string | null;
  credential_id: string | null;
  partner_order_id: string | null;
  moogold_order_id: string | null;
  product_id: string;
  category_id: string | null;
  quantity: number;
  amount: number | null;
  status: 'pending' | 'processing' | 'completed' | 'refunded' | 'incorrect-details' | 'failed';
  request_payload: any;
  response_payload: any | null;
  error_code: string | null;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderEventRow {
  id: string;
  order_id: string;
  status: string;
  message: string | null;
  raw_payload: any | null;
  created_at: Date;
}

export async function createOrder(params: {
  userId: string;
  apiKeyId?: string | null;
  credentialId?: string | null;
  partnerOrderId?: string | null;
  productId: string;
  categoryId?: string | null;
  quantity?: number;
  amount?: number | null;
  status?: string;
  requestPayload: any;
}): Promise<OrderRow> {
  const sql = `
    INSERT INTO orders (
      user_id, api_key_id, credential_id, partner_order_id, 
      product_id, category_id, quantity, amount, status, request_payload
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;
  const result = await query(sql, [
    params.userId,
    params.apiKeyId || null,
    params.credentialId || null,
    params.partnerOrderId || null,
    params.productId,
    params.categoryId || null,
    params.quantity || 1,
    params.amount || null,
    params.status || 'pending',
    JSON.stringify(params.requestPayload)
  ]);
  return result.rows[0];
}

export async function findOrders(
  userId: string,
  filters: {
    status?: string;
    search?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ orders: OrderRow[]; total: number }> {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const offset = (page - 1) * limit;

  let sql = `SELECT * FROM orders WHERE user_id = $1`;
  const values: any[] = [userId];
  let valCounter = 2;

  if (filters.status) {
    sql += ` AND status = $${valCounter}`;
    values.push(filters.status);
    valCounter++;
  }

  if (filters.search) {
    sql += ` AND (partner_order_id ILIKE $${valCounter} OR moogold_order_id ILIKE $${valCounter} OR product_id ILIKE $${valCounter})`;
    values.push(`%${filters.search}%`);
    valCounter++;
  }

  if (filters.from) {
    sql += ` AND created_at >= $${valCounter}`;
    values.push(new Date(filters.from));
    valCounter++;
  }

  if (filters.to) {
    sql += ` AND created_at <= $${valCounter}`;
    values.push(new Date(filters.to));
    valCounter++;
  }

  // Count total matching
  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*)');
  const countResult = await query(countSql, values);
  const total = parseInt(countResult.rows[0].count, 10);

  // Add order by, limit and offset
  sql += ` ORDER BY created_at DESC LIMIT $${valCounter} OFFSET $${valCounter + 1}`;
  values.push(limit, offset);

  const result = await query(sql, values);
  return {
    orders: result.rows,
    total
  };
}

export async function findOrderById(id: string, userId?: string): Promise<OrderRow | null> {
  let sql = `SELECT * FROM orders WHERE id = $1`;
  const values = [id];
  if (userId) {
    sql += ` AND user_id = $2`;
    values.push(userId);
  }
  const result = await query(sql, values);
  return result.rows[0] || null;
}

export async function findOrderByPartnerOrderId(partnerOrderId: string, apiKeyId: string): Promise<OrderRow | null> {
  const sql = `SELECT * FROM orders WHERE partner_order_id = $1 AND api_key_id = $2;`;
  const result = await query(sql, [partnerOrderId, apiKeyId]);
  return result.rows[0] || null;
}

export async function updateOrderStatus(
  id: string,
  status: string,
  params?: {
    moogoldOrderId?: string | null;
    amount?: number | null;
    responsePayload?: any;
    errorCode?: string | null;
    errorMessage?: string | null;
  }
): Promise<OrderRow | null> {
  let sql = `UPDATE orders SET status = $2, updated_at = NOW()`;
  const values: any[] = [id, status];
  let valCounter = 3;

  if (params?.moogoldOrderId !== undefined) {
    sql += `, moogold_order_id = $${valCounter}`;
    values.push(params.moogoldOrderId);
    valCounter++;
  }

  if (params?.amount !== undefined) {
    sql += `, amount = $${valCounter}`;
    values.push(params.amount);
    valCounter++;
  }

  if (params?.responsePayload !== undefined) {
    sql += `, response_payload = $${valCounter}`;
    values.push(JSON.stringify(params.responsePayload));
    valCounter++;
  }

  if (params?.errorCode !== undefined) {
    sql += `, error_code = $${valCounter}`;
    values.push(params.errorCode);
    valCounter++;
  }

  if (params?.errorMessage !== undefined) {
    sql += `, error_message = $${valCounter}`;
    values.push(params.errorMessage);
    valCounter++;
  }

  sql += ` WHERE id = $1 RETURNING *;`;
  const result = await query(sql, values);
  return result.rows[0] || null;
}

export async function createOrderEvent(
  orderId: string,
  status: string,
  message?: string | null,
  rawPayload?: any
): Promise<OrderEventRow> {
  const sql = `
    INSERT INTO order_events (order_id, status, message, raw_payload)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const result = await query(sql, [orderId, status, message || null, rawPayload ? JSON.stringify(rawPayload) : null]);
  return result.rows[0];
}

export async function getOrderEvents(orderId: string): Promise<OrderEventRow[]> {
  const sql = `SELECT * FROM order_events WHERE order_id = $1 ORDER BY created_at ASC;`;
  const result = await query(sql, [orderId]);
  return result.rows;
}
