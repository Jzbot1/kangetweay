import * as apiKeyQueries from '../db/queries/apiKeys.queries.js';
import { generateApiKey, hashApiKey } from '../lib/keyGenerator.js';
import { redis } from '../config/redis.js';

export async function createKey(
  userId: string,
  name: string,
  environment: 'uat' | 'production',
  ipAllowlist?: string[] | null
) {
  const { rawKey, keyHash, keyPrefix } = generateApiKey();
  
  const keyRow = await apiKeyQueries.createApiKey({
    userId,
    name,
    keyHash,
    keyPrefix,
    environment,
    ipAllowlist: ipAllowlist || null
  });

  const cachePayload = {
    userId: keyRow.user_id,
    keyId: keyRow.id,
    environment: keyRow.environment,
    ipAllowlist: keyRow.ip_allowlist
  };

  // Cache in Redis for 5 minutes (300 seconds)
  await redis.setex(`apikey:${keyHash}`, 300, JSON.stringify(cachePayload));

  return {
    key: keyRow,
    rawKey
  };
}

export async function listKeys(userId: string) {
  return apiKeyQueries.findApiKeysByUserId(userId);
}

export async function deleteKey(id: string, userId: string): Promise<boolean> {
  const keys = await apiKeyQueries.findApiKeysByUserId(userId);
  const targetKey = keys.find(k => k.id === id);
  if (!targetKey) return false;

  const deleted = await apiKeyQueries.deleteApiKey(id, userId);
  if (deleted) {
    await redis.del(`apikey:${targetKey.key_hash}`);
  }
  return deleted;
}

export async function revokeKey(id: string, userId: string) {
  const keys = await apiKeyQueries.findApiKeysByUserId(userId);
  const targetKey = keys.find(k => k.id === id);
  if (!targetKey) return null;

  const revoked = await apiKeyQueries.revokeApiKey(id, userId);
  if (revoked) {
    await redis.del(`apikey:${targetKey.key_hash}`);
  }
  return revoked;
}

export async function validateApiKey(rawKey: string) {
  const keyHash = hashApiKey(rawKey);

  // Check Redis Cache
  const cached = await redis.get(`apikey:${keyHash}`);
  if (cached) {
    // Refresh Cache TTL (5 minutes)
    await redis.expire(`apikey:${keyHash}`, 300);
    
    const parsed = JSON.parse(cached);
    
    // Update last used in background (async)
    apiKeyQueries.updateApiKeyLastUsed(parsed.keyId).catch(err => {
      console.error('Failed to update API key last used at:', err);
    });
    
    return parsed as {
      userId: string;
      keyId: string;
      environment: 'uat' | 'production';
      ipAllowlist: string[] | null;
    };
  }

  // Check Postgres DB
  const dbKey = await apiKeyQueries.findApiKeyByHash(keyHash);
  if (!dbKey || !dbKey.is_active) {
    return null;
  }

  const payload = {
    userId: dbKey.user_id,
    keyId: dbKey.id,
    environment: dbKey.environment,
    ipAllowlist: dbKey.ip_allowlist
  };

  // Cache in Redis for 5 minutes
  await redis.setex(`apikey:${keyHash}`, 300, JSON.stringify(payload));

  // Update last used
  await apiKeyQueries.updateApiKeyLastUsed(dbKey.id).catch(err => {
    console.error('Failed to update API key last used at:', err);
  });

  return payload;
}
