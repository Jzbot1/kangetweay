import pg from 'pg';
import { env } from './env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL
});

export const query = async (text: string, params?: any[]) => {
  return pool.query(text, params);
};

// Initialize the database tables by reading schema.sql
export const initDatabase = async () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await query(schemaSql);

      // Auto-migrate: check column presence
      const checkApproved = await query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='users' AND column_name='is_approved';
      `);
      if (checkApproved.rowCount === 0) {
        console.log('Migrating: Adding is_approved column to users table...');
        await query('ALTER TABLE users ADD COLUMN is_approved BOOLEAN DEFAULT false;');
        await query(`
          UPDATE users 
          SET is_approved = true 
          WHERE email IN ('zomuansangajacob523@gmail.com', 'test@example.com');
        `);
      }

      const checkRole = await query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='users' AND column_name='role';
      `);
      if (checkRole.rowCount === 0) {
        console.log('Migrating: Adding role column to users table...');
        await query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';");
        await query(`
          UPDATE users 
          SET role = 'admin' 
          WHERE email = 'zomuansangajacob523@gmail.com';
        `);
      }
      
      console.log('Database tables verified/initialized successfully.');
    } else {
      console.warn('Schema file not found at:', schemaPath);
    }
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
  }
};
