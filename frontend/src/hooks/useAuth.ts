import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { useAuthStore } from '../stores/authStore.js';
import { useUiStore } from '../stores/uiStore.js';
import { queryKeys } from '../lib/queryKeys.js';
import { AuthResponse, User } from '../types/user.types.js';

export function useAuth() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const logoutAction = useAuthStore((state) => state.logout);
  const { addToast } = useUiStore();

  // 1. Get Me Query
  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const res = await api.get<{ user: User }>('/auth/me');
      const state = useAuthStore.getState();
      if (state.accessToken && state.refreshToken) {
        state.setAuth(res.data.user, state.accessToken, state.refreshToken);
      }
      return res.data.user;
    },
    enabled: useAuthStore.getState().isAuthenticated,
    retry: 1
  });

  // 2. Login Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      const res = await api.post<AuthResponse>('/auth/login', credentials);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      addToast(`Welcome back, ${data.user.name}!`, 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Login failed. Please try again.';
      addToast(msg, 'error');
    }
  });

  // 3. Register Mutation
  const registerMutation = useMutation({
    mutationFn: async (params: Record<string, string>) => {
      const res = await api.post<AuthResponse>('/auth/register', params);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      addToast(`Account created. Welcome, ${data.user.name}!`, 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Registration failed.';
      addToast(msg, 'error');
    }
  });

  // 4. Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      await api.post('/auth/logout', { refreshToken });
    },
    onSettled: () => {
      logoutAction();
      queryClient.clear();
      addToast('Logged out successfully', 'info');
    }
  });

  return {
    user: meQuery.data,
    isLoadingUser: meQuery.isLoading,
    isErrorUser: meQuery.isError,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutateAsync
  };
}
