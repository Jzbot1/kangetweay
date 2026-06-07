import crypto from 'crypto';

export interface MooGoldHeaders {
  Authorization: string;
  auth: string;
  timestamp: string;
}

export function buildMooGoldHeaders(
  payload: object,
  path: string, // e.g. "order/create_order" — no leading slash
  partnerId: string,
  secretKey: string
): MooGoldHeaders {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payloadJSON = JSON.stringify(payload);
  
  // Create signature using the formula: hash_hmac('SHA256', Payload + Current Timestamp + Path, YOUR_SECRET_HERE)
  const stringToSign = payloadJSON + timestamp + path;
  const auth = crypto
    .createHmac('sha256', secretKey)
    .update(stringToSign)
    .digest('hex');
  
  // Basic Auth is base64_encode(partnerId:secretKey)
  const base64Auth = Buffer.from(`${partnerId}:${secretKey}`).toString('base64');
  const Authorization = `Basic ${base64Auth}`;
  
  return {
    Authorization,
    auth,
    timestamp
  };
}
