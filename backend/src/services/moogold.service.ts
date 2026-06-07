import { buildMooGoldHeaders } from '../lib/moogoldSigner.js';
import { env } from '../config/env.js';

export interface MooGoldCredential {
  partnerId: string;
  secretKey: string;
  environment: 'uat' | 'production';
}

export interface MooGoldOrderResponse {
  status: boolean;
  message: string;
  account_details?: {
    player_id?: string;
    server_id?: string;
    order_id?: string;
  };
  order_id?: number | string;
  date_created?: string;
  order_status?: string;
  item?: any[];
  total?: string;
}

export interface MooGoldProduct {
  ID: string;
  post_title: string;
  Product_Name?: string;
  Image_URL?: string;
  Variation?: {
    variation_name: string;
    variation_id: number;
    variation_price: number;
    stock_status: string;
  }[];
}

export interface MooGoldCategory {
  id: number;
  name: string;
}

const MOOGOLD_ERROR_MAP: Record<string, string> = {
  "109": "Invalid Signature",
  "110": "Error Occured, please try again",
  "111": "Insufficient balance",
  "113": "Product ID missing",
  "114": "Product out of stock",
  "116": "One order only allow a maximum of 10 quantity",
  "117": "Max quantity exceeded (limit: 10)",
  "118": "Product is blocked",
  "403": "Invalid credentials or unauthorized",
  "418": "Incorrect API path",
  "419": "Missing required arguments",
  "420": "Duplicate partner order ID",
  "421": "Partner order ID not found",
  "422": "Product ID invalid or not authorized",
  "423": "Category ID missing",
  "424": "Invalid payment method",
  "425": "Invalid amount",
  "426": "Timestamp incorrect",
  "433": "IP not allowed",
  "434": "Rate limit exceeded",
  "435": "Invalid status filter",
  "436": "Start date after end date",
  "437": "Date range exceeds 30 days",
  "1111": "Endpoint restricted to members only"
};

export class MooGoldService {
  private baseUrl = env.MOOGOLD_BASE_URL;

  private isMock(credential: MooGoldCredential): boolean {
    return credential.partnerId.toLowerCase().startsWith('mock') || env.DATABASE_URL.includes('localhost') && credential.partnerId === 'test';
  }

  private async request<T>(
    credential: MooGoldCredential,
    path: string,
    payload: object
  ): Promise<T> {
    if (this.isMock(credential)) {
      return this.mockRequest<T>(path, payload);
    }

    const headers = buildMooGoldHeaders(payload, path, credential.partnerId, credential.secretKey);
    const url = `${this.baseUrl}/${path}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': headers.Authorization,
          'auth': headers.auth,
          'timestamp': headers.timestamp
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json() as any;

      if (!response.ok || (data && data.err_code)) {
        const errCode = data?.err_code || response.status.toString();
        const errMsg = data?.err_message || data?.message || 'Unknown MooGold Error';
        this.handleMooGoldError(errCode, errMsg);
      }

      return data as T;
    } catch (error: any) {
      if (error.name === 'MooGoldError') throw error;
      throw new Error(`MooGold API Request failed: ${error.message}`);
    }
  }

  private handleMooGoldError(errCode: string, errMessage: string): never {
    const mappedMessage = MOOGOLD_ERROR_MAP[errCode] || errMessage;
    const err = new Error(mappedMessage);
    err.name = 'MooGoldError';
    (err as any).errorCode = errCode;
    throw err;
  }

  async createOrder(
    credential: MooGoldCredential,
    body: {
      category: number;
      'product-id': number;
      quantity: number;
      partnerOrderId?: string;
      [key: string]: any;
    }
  ): Promise<MooGoldOrderResponse> {
    const payload = {
      path: 'order/create_order',
      data: {
        category: body.category,
        'product-id': body['product-id'],
        quantity: body.quantity,
        ...body.fields
      },
      partnerOrderId: body.partnerOrderId
    };

    return this.request<MooGoldOrderResponse>(credential, 'order/create_order', payload);
  }

  async getOrder(credential: MooGoldCredential, orderId: number | string): Promise<MooGoldOrderResponse> {
    const payload = {
      path: 'order/order_detail',
      order_id: Number(orderId)
    };
    return this.request<MooGoldOrderResponse>(credential, 'order/order_detail', payload);
  }

  async getOrderByPartnerId(credential: MooGoldCredential, partnerOrderId: string): Promise<MooGoldOrderResponse> {
    const payload = {
      path: 'order/order_detail_partner_id',
      partner_order_id: partnerOrderId
    };
    return this.request<MooGoldOrderResponse>(credential, 'order/order_detail_partner_id', payload);
  }

  async getProducts(credential: MooGoldCredential, categoryId: number): Promise<MooGoldProduct[]> {
    const payload = {
      path: 'product/list_product',
      category_id: categoryId
    };
    return this.request<MooGoldProduct[]>(credential, 'product/list_product', payload);
  }

  async getProductDetail(credential: MooGoldCredential, productId: number): Promise<MooGoldProduct> {
    const payload = {
      path: 'product/product_detail',
      product_id: productId
    };
    return this.request<MooGoldProduct>(credential, 'product/product_detail', payload);
  }

  async getCategories(credential: MooGoldCredential): Promise<MooGoldCategory[]> {
    // MooGold API doesn't have a direct categories list, but list_product lists categories. 
    // We return a mock list of categories or pre-mapped categories as per documentation.
    return [
      { id: 50, name: 'Direct Top-Up' },
      { id: 51, name: 'Gift Cards' },
      { id: 766, name: 'Garena Shells' },
      { id: 538, name: 'Google Play' },
      { id: 874, name: 'Netflix' },
      { id: 451, name: 'Razer Gold' }
    ];
  }

  async getUserBalance(credential: MooGoldCredential): Promise<{ balance: number; currency: string }> {
    const payload = {
      path: 'user/balance'
    };
    const response = await this.request<{ balance: string; currency: string }>(credential, 'user/balance', payload);
    return {
      balance: parseFloat(response.balance || '0'),
      currency: response.currency || 'USD'
    };
  }

  private mockRequest<T>(path: string, payload: any): T {
    console.log(`[MOCK MODE] Simulating MooGold API request for path: ${path}`);
    
    if (path === 'user/balance') {
      return { balance: '1250.75', currency: 'USD' } as any as T;
    }
    
    if (path === 'product/list_product') {
      return [
        { ID: '215570', post_title: 'Garena Free Fire Diamonds' },
        { ID: '37007', post_title: 'PUBG Mobile UC' },
        { ID: '7847', post_title: 'Mobile Legends Bang Bang' }
      ] as any as T;
    }
    
    if (path === 'product/product_detail') {
      const prodId = payload.product_id;
      return {
        Product_Name: prodId === 37007 ? 'PUBG Mobile UC' : 'Garena Free Fire',
        Image_URL: 'https://cdn.moogold.com/logo.svg',
        Variation: [
          { variation_name: '110 Diamonds', variation_id: 215570, variation_price: 1.01, stock_status: 'instock' },
          { variation_name: '210 Diamonds', variation_id: 215571, variation_price: 2.02, stock_status: 'instock' },
          { variation_name: '60 UC', variation_id: 370071, variation_price: 0.99, stock_status: 'instock' }
        ]
      } as any as T;
    }

    if (path === 'order/create_order') {
      const randomOrderId = Math.floor(100000 + Math.random() * 900000).toString();
      return {
        status: true,
        message: 'Order has been created successfully',
        account_details: {
          player_id: payload.data?.['User ID'] || '12314123',
          server_id: payload.data?.['Server'] || '1',
          order_id: randomOrderId
        }
      } as any as T;
    }

    if (path === 'order/order_detail' || path === 'order/order_detail_partner_id') {
      const orderId = payload.order_id || 952272;
      return {
        order_id: orderId,
        date_created: new Date().toISOString().slice(0, 19).replace('T', ' '),
        order_status: 'completed',
        item: [
          {
            product: 'Garena Free Fire - 110 Diamonds',
            variation_id: 215570,
            quantity: 1,
            price: '1.01',
            player_id: '12314123',
            server_id: '3402',
            voucher_code: ['Serial Number: 2407145348 Pin Code: 1053152474740245']
          }
        ],
        total: '1.01'
      } as any as T;
    }

    throw new Error(`Mock implementation not found for path: ${path}`);
  }
}
export const moogoldService = new MooGoldService();
