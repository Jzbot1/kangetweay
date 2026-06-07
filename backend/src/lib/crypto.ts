import crypto from 'crypto';

export function encrypt(plaintext: string, masterKeyHex: string): { encrypted: string; iv: string } {
  const iv = crypto.randomBytes(12);
  const key = Buffer.from(masterKeyHex, 'hex');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    encrypted: `${encrypted}:${authTag}`,
    iv: iv.toString('hex')
  };
}

export function decrypt(encryptedWithTag: string, ivHex: string, masterKeyHex: string): string {
  const parts = encryptedWithTag.split(':');
  const encrypted = parts[0];
  const authTag = parts[1];
  
  const iv = Buffer.from(ivHex, 'hex');
  const key = Buffer.from(masterKeyHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
