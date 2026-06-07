import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  is_active: boolean;
  is_approved: boolean;
  role: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Load initial state from local storage if available
  const storedUser = localStorage.getItem('jz_user');
  const storedAccess = localStorage.getItem('jz_access');
  const storedRefresh = localStorage.getItem('jz_refresh');

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    accessToken: storedAccess || null,
    refreshToken: storedRefresh || null,
    isAuthenticated: !!storedAccess,
    setAuth: (user, accessToken, refreshToken) => {
      localStorage.setItem('jz_user', JSON.stringify(user));
      localStorage.setItem('jz_access', accessToken);
      localStorage.setItem('jz_refresh', refreshToken);
      set({ user, accessToken, refreshToken, isAuthenticated: true });
    },
    setAccessToken: (accessToken) => {
      localStorage.setItem('jz_access', accessToken);
      set({ accessToken, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('jz_user');
      localStorage.removeItem('jz_access');
      localStorage.removeItem('jz_refresh');
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    }
  };
});
