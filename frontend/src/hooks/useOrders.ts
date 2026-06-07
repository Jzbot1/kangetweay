import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { queryKeys } from '../lib/queryKeys.js';
import { OrdersListResponse, Order, OrderEvent } from '../types/order.types.js';

export function useOrders(filters: Record<string, any> = {}) {
  // 1. Fetch Orders List
  const listQuery = useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: async () => {
      // Build search params
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key].toString());
        }
      });

      const res = await api.get<OrdersListResponse>(`/orders?${params.toString()}`);
      return res.data;
    }
  });

  return {
    orders: listQuery.data?.orders || [],
    total: listQuery.data?.total || 0,
    page: listQuery.data?.page || 1,
    limit: listQuery.data?.limit || 10,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch
  };
}

export function useOrderDetail(orderId: string | null) {
  // 2. Fetch Single Order Details (with Events Timeline)
  const detailQuery = useQuery({
    queryKey: queryKeys.orders.detail(orderId || ''),
    queryFn: async () => {
      if (!orderId) return null;
      const res = await api.get<{ order: Order; events: OrderEvent[] }>(`/orders/${orderId}`);
      return res.data;
    },
    enabled: !!orderId
  });

  return {
    order: detailQuery.data?.order || null,
    events: detailQuery.data?.events || [],
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    refetch: detailQuery.refetch
  };
}
