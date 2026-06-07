export interface Order {
  id: string;
  user_id: string;
  api_key_id: string | null;
  credential_id: string | null;
  partner_order_id: string | null;
  moogold_order_id: string | null;
  product_id: string;
  category_id: string | null;
  quantity: number;
  amount: string | number | null;
  status: 'pending' | 'processing' | 'completed' | 'refunded' | 'incorrect-details' | 'failed';
  request_payload: any;
  response_payload: any | null;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  status: string;
  message: string | null;
  raw_payload: any | null;
  created_at: string;
}

export interface OrdersListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}
