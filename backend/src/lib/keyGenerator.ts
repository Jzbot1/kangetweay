import crypto from 'crypto';

export function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const randomHex = crypto.randomBytes(32).toString('hex'); // 64 chars
  const rawKey = `mg_live_${randomHex}`;
  
  // Compute SHA-256 hash
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  
  // Key prefix is mg_live_ + first 8 hex characters
  const keyPrefix = `mg_live_${randomHex.substring(0, 8)}`;
  
  return {
    rawKey,
    keyHash,
    keyPrefix
  };
}

export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}
