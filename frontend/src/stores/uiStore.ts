import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UiState {
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
  toasts: ToastMessage[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set, get) => {
  // Sync HTML class for Tailwind dark mode toggle
  const storedTheme = (localStorage.getItem('jz_theme') as 'dark' | 'light') || 'dark';
  if (storedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return {
    sidebarOpen: true,
    theme: storedTheme,
    toasts: [],
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    toggleTheme: () => {
      const current = get().theme;
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('jz_theme', next);
      
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      set({ theme: next });
    },
    addToast: (message, type = 'success') => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, message, type };
      
      set((state) => ({ toasts: [...state.toasts, newToast] }));
      
      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        get().removeToast(id);
      }, 4000);
    },
    removeToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }
  };
});
