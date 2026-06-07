import { query } from '../../config/db.js';

export interface CredentialRow {
  id: string;
  user_id: string;
  label: string;
  partner_id: string;
  encrypted_secret: string;
  encryption_iv: string;
  environment: 'uat' | 'production';
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export async function createCredential(params: {
  userId: string;
  label: string;
  partnerId: string;
  encryptedSecret: string;
  encryptionIv: string;
  environment: 'uat' | 'production';
  isDefault?: boolean;
}): Promise<CredentialRow> {
  // If isDefault is true, unset other defaults for this environment
  if (params.isDefault) {
    await query(
      `UPDATE moogold_credentials SET is_default = false WHERE user_id = $1 AND environment = $2;`,
      [params.userId, params.environment]
    );
  }

  // Check if this is the first credential for this user & environment. If so, make default automatically.
  const checkCount = await query(
    `SELECT COUNT(*)::int FROM moogold_credentials WHERE user_id = $1 AND environment = $2;`,
    [params.userId, params.environment]
  );
  const isFirst = checkCount.rows[0].count === 0;
  const isDefault = params.isDefault || isFirst;

  const sql = `
    INSERT INTO moogold_credentials (user_id, label, partner_id, encrypted_secret, encryption_iv, environment, is_default)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const result = await query(sql, [
    params.userId,
    params.label,
    params.partnerId,
    params.encryptedSecret,
    params.encryptionIv,
    params.environment,
    isDefault
  ]);
  return result.rows[0];
}

export async function findCredentialsByUserId(userId: string): Promise<CredentialRow[]> {
  const sql = `SELECT * FROM moogold_credentials WHERE user_id = $1 ORDER BY created_at DESC;`;
  const result = await query(sql, [userId]);
  return result.rows;
}

export async function findCredentialById(id: string, userId: string): Promise<CredentialRow | null> {
  const sql = `SELECT * FROM moogold_credentials WHERE id = $1 AND user_id = $2;`;
  const result = await query(sql, [id, userId]);
  return result.rows[0] || null;
}

export async function findDefaultCredential(userId: string, environment: 'uat' | 'production'): Promise<CredentialRow | null> {
  const sql = `SELECT * FROM moogold_credentials WHERE user_id = $1 AND environment = $2 AND is_default = true;`;
  const result = await query(sql, [userId, environment]);
  return result.rows[0] || null;
}

export async function updateCredential(
  id: string,
  userId: string,
  params: {
    label: string;
    partnerId: string;
    encryptedSecret?: string;
    encryptionIv?: string;
    environment: 'uat' | 'production';
  }
): Promise<CredentialRow | null> {
  let sql: string;
  let values: any[];

  if (params.encryptedSecret && params.encryptionIv) {
    sql = `
      UPDATE moogold_credentials
      SET label = $3, partner_id = $4, encrypted_secret = $5, encryption_iv = $6, environment = $7, updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;
    values = [id, userId, params.label, params.partnerId, params.encryptedSecret, params.encryptionIv, params.environment];
  } else {
    sql = `
      UPDATE moogold_credentials
      SET label = $3, partner_id = $4, environment = $5, updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;
    values = [id, userId, params.label, params.partnerId, params.environment];
  }

  const result = await query(sql, values);
  return result.rows[0] || null;
}

export async function deleteCredential(id: string, userId: string): Promise<boolean> {
  // Find if deleting default credential
  const cred = await query(`SELECT is_default, environment FROM moogold_credentials WHERE id = $1 AND user_id = $2;`, [id, userId]);
  if (cred.rows.length === 0) return false;

  const wasDefault = cred.rows[0].is_default;
  const env = cred.rows[0].environment;

  const delResult = await query(`DELETE FROM moogold_credentials WHERE id = $1 AND user_id = $2;`, [id, userId]);
  const deleted = (delResult.rowCount ?? 0) > 0;

  // If deleted credential was default, make another one default if possible
  if (deleted && wasDefault) {
    const nextCred = await query(
      `SELECT id FROM moogold_credentials WHERE user_id = $1 AND environment = $2 LIMIT 1;`,
      [userId, env]
    );
    if (nextCred.rows.length > 0) {
      await query(`UPDATE moogold_credentials SET is_default = true WHERE id = $1;`, [nextCred.rows[0].id]);
    }
  }

  return deleted;
}

export async function setDefaultCredential(id: string, userId: string): Promise<CredentialRow | null> {
  const check = await query(`SELECT environment FROM moogold_credentials WHERE id = $1 AND user_id = $2;`, [id, userId]);
  if (check.rows.length === 0) return null;

  const env = check.rows[0].environment;

  // Set all to non-default for this env
  await query(
    `UPDATE moogold_credentials SET is_default = false WHERE user_id = $1 AND environment = $2;`,
    [userId, env]
  );

  // Set selected as default
  const sql = `
    UPDATE moogold_credentials
    SET is_default = true, updated_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  const result = await query(sql, [id, userId]);
  return result.rows[0] || null;
}
