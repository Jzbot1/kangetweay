import { query } from '../../config/db.js';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  is_active: boolean;
  is_approved: boolean;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export async function createUser(name: string, email: string, passwordHash: string): Promise<UserRow> {
  const sql = `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await query(sql, [name, email, passwordHash]);
  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const sql = `SELECT * FROM users WHERE email = $1;`;
  const result = await query(sql, [email]);
  return result.rows[0] || null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const sql = `SELECT * FROM users WHERE id = $1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

export async function findAllUsers(): Promise<UserRow[]> {
  const sql = `SELECT * FROM users ORDER BY created_at DESC;`;
  const result = await query(sql);
  return result.rows;
}

export async function updateUserApproval(id: string, isApproved: boolean): Promise<UserRow | null> {
  const sql = `
    UPDATE users 
    SET is_approved = $2, updated_at = NOW() 
    WHERE id = $1 
    RETURNING *;
  `;
  const result = await query(sql, [id, isApproved]);
  return result.rows[0] || null;
}
