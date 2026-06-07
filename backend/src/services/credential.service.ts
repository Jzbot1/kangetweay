import * as credentialQueries from '../db/queries/credentials.queries.js';
import { encrypt, decrypt } from '../lib/crypto.js';
import { env } from '../config/env.js';
import { MooGoldService } from './moogold.service.js';

const masterKey = env.CREDENTIAL_ENCRYPTION_KEY;

export async function createCredential(params: {
  userId: string;
  label: string;
  partnerId: string;
  secretKey: string;
  environment: 'uat' | 'production';
  isDefault?: boolean;
}) {
  const { encrypted, iv } = encrypt(params.secretKey, masterKey);
  
  const row = await credentialQueries.createCredential({
    userId: params.userId,
    label: params.label,
    partnerId: params.partnerId,
    encryptedSecret: encrypted,
    encryptionIv: iv,
    environment: params.environment,
    isDefault: params.isDefault
  });

  return sanitize(row);
}

export async function listCredentials(userId: string) {
  const list = await credentialQueries.findCredentialsByUserId(userId);
  return list.map(sanitize);
}

export async function getCredentialForUse(id: string, userId: string) {
  const cred = await credentialQueries.findCredentialById(id, userId);
  if (!cred) return null;
  
  const secretKey = decrypt(cred.encrypted_secret, cred.encryption_iv, masterKey);
  return {
    id: cred.id,
    userId: cred.user_id,
    label: cred.label,
    partnerId: cred.partner_id,
    secretKey,
    environment: cred.environment,
    isDefault: cred.is_default
  };
}

export async function updateCredential(
  id: string,
  userId: string,
  params: {
    label: string;
    partnerId: string;
    secretKey?: string;
    environment: 'uat' | 'production';
  }
) {
  let encryptedSecret: string | undefined;
  let encryptionIv: string | undefined;

  if (params.secretKey) {
    const enc = encrypt(params.secretKey, masterKey);
    encryptedSecret = enc.encrypted;
    encryptionIv = enc.iv;
  }

  const row = await credentialQueries.updateCredential(id, userId, {
    label: params.label,
    partnerId: params.partnerId,
    encryptedSecret,
    encryptionIv,
    environment: params.environment
  });

  return row ? sanitize(row) : null;
}

export async function deleteCredential(id: string, userId: string) {
  return credentialQueries.deleteCredential(id, userId);
}

export async function setDefault(id: string, userId: string) {
  const row = await credentialQueries.setDefaultCredential(id, userId);
  return row ? sanitize(row) : null;
}

export async function testConnection(id: string, userId: string) {
  const cred = await getCredentialForUse(id, userId);
  if (!cred) {
    throw new Error('Credential not found');
  }

  const service = new MooGoldService();
  const startTime = Date.now();
  
  try {
    const balanceInfo = await service.getUserBalance(cred);
    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      message: `Connection successful. Wallet Balance: ${balanceInfo.balance} USD`,
      latencyMs
    };
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      message: error.message || 'Connection failed',
      latencyMs
    };
  }
}

export async function testConnectionDirect(cred: { partnerId: string; secretKey: string; environment: 'uat' | 'production' }) {
  const service = new MooGoldService();
  const startTime = Date.now();
  
  try {
    const balanceInfo = await service.getUserBalance(cred);
    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      message: `Connection successful. Wallet Balance: ${balanceInfo.balance} USD`,
      latencyMs
    };
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      message: error.message || 'Connection failed',
      latencyMs
    };
  }
}

// Remove encryption keys and mask secret before returning to client
function sanitize(row: credentialQueries.CredentialRow) {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    partner_id: row.partner_id,
    secret_key: '••••••••',
    environment: row.environment,
    is_default: row.is_default,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export async function getBalances(userId: string) {
  const credentials = await credentialQueries.findCredentialsByUserId(userId);
  const service = new MooGoldService();
  
  const result = {
    uat: { balance: 0, currency: 'USD', configured: false, label: '' },
    production: { balance: 0, currency: 'USD', configured: false, label: '' }
  };
  
  for (const cred of credentials) {
    if (cred.is_default) {
      const decrypted = await getCredentialForUse(cred.id, userId);
      if (decrypted) {
        try {
          const balanceInfo = await service.getUserBalance(decrypted);
          if (cred.environment === 'uat') {
            result.uat = { balance: balanceInfo.balance, currency: balanceInfo.currency, configured: true, label: cred.label };
          } else {
            result.production = { balance: balanceInfo.balance, currency: balanceInfo.currency, configured: true, label: cred.label };
          }
        } catch (err) {
          if (cred.environment === 'uat') {
            result.uat = { balance: 0, currency: 'USD', configured: true, label: cred.label };
          } else {
            result.production = { balance: 0, currency: 'USD', configured: true, label: cred.label };
          }
        }
      }
    }
  }
  return result;
}
