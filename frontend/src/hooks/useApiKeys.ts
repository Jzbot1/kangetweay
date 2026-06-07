import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { queryKeys } from '../lib/queryKeys.js';
import { useUiStore } from '../stores/uiStore.js';
import { ApiKey } from '../types/api.types.js';

export function useApiKeys() {
  const queryClient = useQueryClient();
  const { addToast } = useUiStore();

  // 1. List API Keys
  const listQuery = useQuery({
    queryKey: queryKeys.apiKeys.list,
    queryFn: async () => {
      const res = await api.get<{ keys: ApiKey[] }>('/api-keys');
      return res.data.keys;
    }
  });

  // 2. Create API Key
  const createMutation = useMutation({
    mutationFn: async (params: { name: string; environment: 'uat' | 'production'; ipAllowlist?: string[] | null }) => {
      const res = await api.post<{ key: ApiKey; rawKey: string }>('/api-keys', params);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.list });
      addToast('API key created successfully', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to create API key';
      addToast(msg, 'error');
    }
  });

  // 3. Revoke API Key
  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<{ key: ApiKey }>(`/api-keys/${id}/revoke`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.list });
      addToast('API key revoked successfully', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to revoke API key';
      addToast(msg, 'error');
    }
  });

  // 4. Delete API Key
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api-keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.list });
      addToast('API key deleted successfully', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to delete API key';
      addToast(msg, 'error');
    }
  });

  return {
    keys: listQuery.data || [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    createKey: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    revokeKey: revokeMutation.mutateAsync,
    isRevoking: revokeMutation.isPending,
    deleteKey: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending
  };
}
export default useApiKeys;
