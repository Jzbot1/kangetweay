export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  environment: 'uat' | 'production';
  ip_allowlist: string[] | null;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Credential {
  id: string;
  userId: string;
  label: string;
  partner_id: string;
  secret_key: string;
  environment: 'uat' | 'production';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Webhook {
  id: string;
  user_id: string;
  url: string;
  signing_secret: string;
  is_active: boolean;
  created_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  order_id: string | null;
  event_type: string;
  payload: any;
  http_status: number | null;
  response_body: string | null;
  response_time_ms: number | null;
  attempt_count: number;
  delivered_at: string | null;
  created_at: string;
}
