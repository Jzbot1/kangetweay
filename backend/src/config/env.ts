import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  CREDENTIAL_ENCRYPTION_KEY: z.string().length(64), // 32-byte hex key
  MOOGOLD_BASE_URL: z.string().url().default('https://moogold.com/wp-json/v1/api')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
