import * as orderQueries from '../db/queries/orders.queries.js';
import { BadRequestError, NotFoundError } from '../lib/errors.js';

export async function createOrder(params: {
  userId: string;
  apiKeyId?: string | null;
  credentialId?: string | null;
  partnerOrderId?: string | null;
  productId: string;
  categoryId?: string | null;
  quantity?: number;
  amount?: number | null;
  status?: string;
  requestPayload: any;
}) {
  if (params.partnerOrderId && params.apiKeyId) {
    const existing = await orderQueries.findOrderByPartnerOrderId(params.partnerOrderId, params.apiKeyId);
    if (existing) {
      throw new BadRequestError(`Duplicate partner order ID: ${params.partnerOrderId}`, 'DUPLICATE_PARTNER_ORDER_ID');
    }
  }

  const order = await orderQueries.createOrder(params);
  
  // Create initial order event
  await orderQueries.createOrderEvent(
    order.id,
    order.status,
    'Order created and queued for processing',
    params.requestPayload
  );

  return order;
}

export async function getOrderDetails(orderId: string, userId?: string) {
  const order = await orderQueries.findOrderById(orderId, userId);
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  const events = await orderQueries.getOrderEvents(orderId);
  return {
    order,
    events
  };
}

export async function getOrderByPartnerId(partnerOrderId: string, apiKeyId: string) {
  const order = await orderQueries.findOrderByPartnerOrderId(partnerOrderId, apiKeyId);
  if (!order) {
    throw new NotFoundError(`Order with partner order ID ${partnerOrderId} not found`);
  }
  return order;
}

export async function listOrders(
  userId: string,
  filters: {
    status?: string;
    search?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }
) {
  return orderQueries.findOrders(userId, filters);
}

export async function updateOrderStatus(
  id: string,
  status: 'pending' | 'processing' | 'completed' | 'refunded' | 'incorrect-details' | 'failed',
  params?: {
    moogoldOrderId?: string | null;
    amount?: number | null;
    responsePayload?: any;
    errorCode?: string | null;
    errorMessage?: string | null;
    eventMessage?: string;
  }
) {
  const updatedOrder = await orderQueries.updateOrderStatus(id, status, params);
  
  if (updatedOrder) {
    await orderQueries.createOrderEvent(
      id,
      status,
      params?.eventMessage || `Order status updated to ${status}`,
      params?.responsePayload || null
    );
  }

  return updatedOrder;
}
