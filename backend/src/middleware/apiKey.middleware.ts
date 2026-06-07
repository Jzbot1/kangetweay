import { Context, Next } from 'hono';
import { validateApiKey } from '../services/apiKey.service.js';
import { findUserById } from '../db/queries/users.queries.js';
import { UnauthorizedError } from '../lib/errors.js';

export async function apiKeyMiddleware(c: Context, next: Next) {
  const apiKey = c.req.header('X-API-Key');
  if (!apiKey) {
    throw new UnauthorizedError('Missing X-API-Key header', 'MISSING_API_KEY');
  }

  const keyInfo = await validateApiKey(apiKey);
  if (!keyInfo) {
    throw new UnauthorizedError('Invalid or inactive API key', 'INVALID_API_KEY');
  }

  // Enforce admin approval check
  const user = await findUserById(keyInfo.userId);
  if (!user || !user.is_approved) {
    throw new UnauthorizedError('Your account requires administrator approval before calling the gateway proxy API.', 'ACCOUNT_NOT_APPROVED');
  }

  c.set('apiKey', keyInfo);
  await next();
}

export type ApiKeyContext = {
  Variables: {
    apiKey: {
      userId: string;
      keyId: string;
      environment: 'uat' | 'production';
      ipAllowlist: string[] | null;
    };
  };
};
