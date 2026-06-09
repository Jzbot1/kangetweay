import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { queryKeys } from '../lib/queryKeys.js';
import { useUiStore } from '../stores/uiStore.js';
import { User } from '../types/user.types.js';

export function useAdminUsers() {
  const queryClient = useQueryClient();
  const { addToast } = useUiStore();

  // 1. Fetch Users List
  const listQuery = useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: async () => {
      const res = await api.get<{ users: User[] }>('/admin/users');
      return res.data.users;
    }
  });

  // 2. Approve User Mutation
  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.post<{ user: User }>(`/admin/users/${userId}/approve`);
      return res.data.user;
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
      addToast(`User ${updatedUser.name} approved successfully`, 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to approve user';
      addToast(msg, 'error');
    }
  });

  // 3. Disapprove User Mutation
  const disapproveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.post<{ user: User }>(`/admin/users/${userId}/disapprove`);
      return res.data.user;
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
      addToast(`User ${updatedUser.name} approval status revoked`, 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to revoke approval';
      addToast(msg, 'error');
    }
  });

  // 4. Update Monthly Limit Mutation
  const updateLimitMutation = useMutation({
    mutationFn: async ({ userId, limit }: { userId: string; limit: number | null }) => {
      const res = await api.patch<{ user: User }>(`/admin/users/${userId}/limit`, {
        monthly_limit: limit
      });
      return res.data.user;
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
      const limitText = updatedUser.monthly_limit != null
        ? `set to ${updatedUser.monthly_limit.toLocaleString()} req/month`
        : 'removed (unlimited)';
      addToast(`Limit for ${updatedUser.name} ${limitText}`, 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to update limit';
      addToast(msg, 'error');
    }
  });

  // Compute statistics
  const users = listQuery.data || [];
  const stats = {
    total: users.length,
    approved: users.filter(u => u.is_approved).length,
    pending: users.filter(u => !u.is_approved).length,
  };

  return {
    users,
    stats,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch,
    approveUser: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    disapproveUser: disapproveMutation.mutateAsync,
    isDisapproving: disapproveMutation.isPending,
    updateUserLimit: updateLimitMutation.mutateAsync,
    isUpdatingLimit: updateLimitMutation.isPending,
    updatingLimitUserId: updateLimitMutation.isPending
      ? (updateLimitMutation.variables as any)?.userId
      : null,
  };
}
export default useAdminUsers;
