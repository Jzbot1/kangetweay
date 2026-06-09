import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { queryKeys } from '../lib/queryKeys.js';

export interface UsageQuota {
  used: number;
  limit: number | null;   // null = unlimited
  period: 'monthly';
  resetDate: string;      // YYYY-MM-DD of next month start
}

export function useUsageQuota() {
  const query = useQuery({
    queryKey: queryKeys.usage.quota,
    queryFn: async () => {
      const res = await api.get<UsageQuota>('/usage/quota');
      return res.data;
    },
    staleTime: 60_000 // 1 minute
  });

  const quota = query.data;

  // Derived helpers
  const percent = quota?.limit
    ? Math.min(100, Math.round((quota.used / quota.limit) * 100))
    : null;

  // Color tier: green < 70%, amber 70–89%, red >= 90%
  const barColor = percent === null
    ? 'bg-indigo-500'
    : percent >= 90
    ? 'bg-red-500'
    : percent >= 70
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  const textColor = percent === null
    ? 'text-indigo-400'
    : percent >= 90
    ? 'text-red-400'
    : percent >= 70
    ? 'text-amber-400'
    : 'text-emerald-400';

  return {
    quota,
    percent,
    barColor,
    textColor,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export default useUsageQuota;
