import { query } from '../../config/db.js';

export interface ApiKeyRow {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  environment: 'uat' | 'production';
  ip_allowlist: string[] | null;
  last_used_at: Date | null;
  is_active: boolean;
  created_at: Date;
}

export async function createApiKey(params: {
  userId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  environment: 'uat' | 'production';
  ipAllowlist?: string[] | null;
}): Promise<ApiKeyRow> {
  const sql = `
    INSERT INTO api_keys (user_id, name, key_hash, key_prefix, environment, ip_allowlist)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const result = await query(sql, [
    params.userId,
    params.name,
    params.keyHash,
    params.keyPrefix,
    params.environment,
    params.ipAllowlist || null
  ]);
  return result.rows[0];
}

export async function findApiKeyByHash(keyHash: string): Promise<ApiKeyRow | null> {
  const sql = `SELECT * FROM api_keys WHERE key_hash = $1 AND is_active = true;`;
  const result = await query(sql, [keyHash]);
  return result.rows[0] || null;
}

export async function findApiKeysByUserId(userId: string): Promise<ApiKeyRow[]> {
  const sql = `SELECT * FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC;`;
  const result = await query(sql, [userId]);
  return result.rows;
}

export async function deleteApiKey(id: string, userId: string): Promise<boolean> {
  const sql = `DELETE FROM api_keys WHERE id = $1 AND user_id = $2;`;
  const result = await query(sql, [id, userId]);
  return (result.rowCount ?? 0) > 0;
}

export async function revokeApiKey(id: string, userId: string): Promise<ApiKeyRow | null> {
  const sql = `
    UPDATE api_keys 
    SET is_active = false 
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  const result = await query(sql, [id, userId]);
  return result.rows[0] || null;
}

export async function updateApiKeyLastUsed(id: string): Promise<void> {
  const sql = `UPDATE api_keys SET last_used_at = NOW() WHERE id = $1;`;
  await query(sql, [id]);
}
