import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { queryKeys } from '../lib/queryKeys.js';
import { useUiStore } from '../stores/uiStore.js';
import { Credential } from '../types/api.types.js';

export function useCredentials() {
  const queryClient = useQueryClient();
  const { addToast } = useUiStore();

  // 1. List credentials
  const listQuery = useQuery({
    queryKey: queryKeys.credentials.list,
    queryFn: async () => {
      const res = await api.get<{ credentials: Credential[] }>('/credentials');
      return res.data.credentials;
    }
  });

  // 2. Create credential
  const createMutation = useMutation({
    mutationFn: async (params: { label: string; partnerId: string; secretKey: string; environment: 'uat' | 'production' }) => {
      const res = await api.post<{ credential: Credential }>('/credentials', params);
      return res.data.credential;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credentials.list });
      addToast('MooGold credentials added successfully', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to add credentials';
      addToast(msg, 'error');
    }
  });

  // 3. Update credential
  const updateMutation = useMutation({
    mutationFn: async (params: { id: string; label: string; partnerId: string; secretKey?: string; environment: 'uat' | 'production' }) => {
      const { id, ...body } = params;
      const res = await api.put<{ credential: Credential }>(`/credentials/${id}`, body);
      return res.data.credential;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credentials.list });
      addToast('MooGold credentials updated successfully', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to update credentials';
      addToast(msg, 'error');
    }
  });

  // 4. Delete credential
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/credentials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credentials.list });
      addToast('Credentials deleted successfully', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to delete credentials';
      addToast(msg, 'error');
    }
  });

  // 5. Set default
  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<{ credential: Credential }>(`/credentials/${id}/set-default`);
      return res.data.credential;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credentials.list });
      addToast('Default credentials updated', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to set default credentials';
      addToast(msg, 'error');
    }
  });

  // 7. Test connection direct (unsaved)
  const testDirectMutation = useMutation({
    mutationFn: async (params: { id?: string; partnerId: string; secretKey?: string; environment: 'uat' | 'production' }) => {
      const res = await api.post<{ success: boolean; message: string; latencyMs: number }>('/credentials/test', params);
      return res.data;
    }
  });

  // 6. Test connection
  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<{ success: boolean; message: string; latencyMs: number }>(`/credentials/${id}/test`);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        addToast(`${data.message} (Latency: ${data.latencyMs}ms)`, 'success');
      } else {
        addToast(data.message, 'error');
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Connection test failed';
      addToast(msg, 'error');
    }
  });

  return {
    credentials: listQuery.data || [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    createCredential: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCredential: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCredential: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    setDefault: setDefaultMutation.mutateAsync,
    isSettingDefault: setDefaultMutation.isPending,
    testConnection: testMutation.mutateAsync,
    isTesting: testMutation.isPending,
    testConnectionDirect: testDirectMutation.mutateAsync,
    isTestingDirect: testDirectMutation.isPending
  };
}

export interface BalanceDetail {
  balance: number;
  currency: string;
  configured: boolean;
  label: string;
}

export interface CredentialsBalances {
  uat: BalanceDetail;
  production: BalanceDetail;
}

export function useCredentialsBalances() {
  return useQuery({
    queryKey: queryKeys.credentials.balances,
    queryFn: async () => {
      const res = await api.get<{ balances: CredentialsBalances }>('/credentials/balances');
      return res.data.balances;
    },
    refetchInterval: 30000,
    retry: 1
  });
}

export default useCredentials;
