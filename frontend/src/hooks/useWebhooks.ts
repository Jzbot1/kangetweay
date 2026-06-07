import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { queryKeys } from '../lib/queryKeys.js';
import { useUiStore } from '../stores/uiStore.js';
import { Webhook, WebhookLog } from '../types/api.types.js';

export function useWebhooks() {
  const queryClient = useQueryClient();
  const { addToast } = useUiStore();

  // 1. Get User Webhook configuration
  const detailQuery = useQuery({
    queryKey: queryKeys.webhooks.detail,
    queryFn: async () => {
      const res = await api.get<{ webhook: Webhook | null }>('/webhooks');
      return res.data.webhook;
    }
  });

  // 2. Create Webhook
  const createMutation = useMutation({
    mutationFn: async (params: { url: string }) => {
      const res = await api.post<{ webhook: Webhook; signingSecret: string }>('/webhooks', params);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.webhooks.detail });
      addToast('Webhook endpoint configured successfully', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to configure webhook';
      addToast(msg, 'error');
    }
  });

  // 3. Update Webhook
  const updateMutation = useMutation({
    mutationFn: async (params: { id: string; url: string; isActive: boolean }) => {
      const { id, ...body } = params;
      const res = await api.put<{ webhook: Webhook }>(`/webhooks/${id}`, body);
      return res.data.webhook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.webhooks.detail });
      addToast('Webhook configuration updated', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to update webhook';
      addToast(msg, 'error');
    }
  });

  // 4. Delete Webhook
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/webhooks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.webhooks.detail });
      addToast('Webhook endpoint deleted', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to delete webhook';
      addToast(msg, 'error');
    }
  });

  return {
    webhook: detailQuery.data || null,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    createWebhook: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateWebhook: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteWebhook: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending
  };
}

export function useWebhookLogs(webhookId: string | null, page = 1, limit = 10) {
  const queryClient = useQueryClient();
  const { addToast } = useUiStore();

  // 1. Get Webhook Delivery Logs
  const logsQuery = useQuery({
    queryKey: queryKeys.webhooks.logs(webhookId || '', page, limit),
    queryFn: async () => {
      if (!webhookId) return { logs: [], total: 0 };
      const res = await api.get<{ logs: WebhookLog[]; total: number }>(
        `/webhooks/${webhookId}/logs?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    enabled: !!webhookId
  });

  // 2. Resend Webhook payload
  const resendMutation = useMutation({
    mutationFn: async (logId: string) => {
      const res = await api.post<{ success: boolean }>(`/webhooks/logs/${logId}/resend`);
      return res.data;
    },
    onSuccess: () => {
      if (webhookId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.webhooks.logs(webhookId, page, limit) });
      }
      addToast('Webhook payload queued for resend', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to resend webhook';
      addToast(msg, 'error');
    }
  });

  return {
    logs: logsQuery.data?.logs || [],
    total: logsQuery.data?.total || 0,
    isLoading: logsQuery.isLoading,
    isError: logsQuery.isError,
    resendWebhook: resendMutation.mutateAsync,
    isResending: resendMutation.isPending
  };
}
