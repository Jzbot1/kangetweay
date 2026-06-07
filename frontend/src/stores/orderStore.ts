import { create } from 'zustand';

interface OrderFilters {
  status: string;
  search: string;
  from: string;
  to: string;
  page: number;
  limit: number;
}

interface OrderState {
  filters: OrderFilters;
  selectedOrderId: string | null;
  setFilters: (newFilters: Partial<OrderFilters>) => void;
  resetFilters: () => void;
  setSelectedOrderId: (id: string | null) => void;
}

const defaultFilters: OrderFilters = {
  status: '',
  search: '',
  from: '',
  to: '',
  page: 1,
  limit: 10
};

export const useOrderStore = create<OrderState>((set) => ({
  filters: defaultFilters,
  selectedOrderId: null,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),
  resetFilters: () => set({ filters: defaultFilters }),
  setSelectedOrderId: (selectedOrderId) => set({ selectedOrderId })
}));
