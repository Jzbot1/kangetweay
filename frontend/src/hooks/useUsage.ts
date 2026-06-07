import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { queryKeys } from '../lib/queryKeys.js';

export function useUsage(period: '7d' | '30d' | '90d' = '7d') {
  
  // 1. Stats Counter Summary
  const statsQuery = useQuery({
    queryKey: queryKeys.usage.stats(period),
    queryFn: async () => {
      const res = await api.get<{
        totalRequests: number;
        successRate: number;
        callsToday: number;
        activeKeys: number;
      }>(`/usage/stats?period=${period}`);
      return res.data;
    }
  });

  // 2. Charting History
  const chartQuery = useQuery({
    queryKey: queryKeys.usage.chart(period),
    queryFn: async () => {
      const res = await api.get<{
        daily: {
          date: string;
          requests: number;
          success: number;
          failed: number;
        }[];
      }>(`/usage/chart?period=${period}`);
      return res.data.daily;
    }
  });

  // 3. Endpoint details
  const endpointsQuery = useQuery({
    queryKey: queryKeys.usage.endpoints(period),
    queryFn: async () => {
      const res = await api.get<{
        endpoints: {
          path: string;
          count: number;
        }[];
      }>(`/usage/by-endpoint?period=${period}`);
      return res.data.endpoints;
    }
  });

  return {
    stats: statsQuery.data || { totalRequests: 0, successRate: 100, callsToday: 0, activeKeys: 0 },
    isLoadingStats: statsQuery.isLoading,
    chart: chartQuery.data || [],
    isLoadingChart: chartQuery.isLoading,
    endpoints: endpointsQuery.data || [],
    isLoadingEndpoints: endpointsQuery.isLoading,
    refetchAll: () => {
      statsQuery.refetch();
      chartQuery.refetch();
      endpointsQuery.refetch();
    }
  };
}
export default useUsage;
