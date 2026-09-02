import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface UiState {
  toasts: Toast[];
  globalLoading: boolean;
}

interface UiActions {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  setGlobalLoading: (loading: boolean) => void;
}

type UiStore = UiState & UiActions;

export const useUiStore = create<UiStore>()((set) => ({
  toasts: [],
  globalLoading: false,

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

    // Auto-remove after duration
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, toast.duration);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  showSuccess: (message, duration = 4000) =>
    useUiStore.getState().addToast({ type: 'success', message, duration }),

  showError: (message, duration = 5000) =>
    useUiStore.getState().addToast({ type: 'error', message, duration }),

  showWarning: (message, duration = 4000) =>
    useUiStore.getState().addToast({ type: 'warning', message, duration }),

  showInfo: (message, duration = 4000) =>
    useUiStore.getState().addToast({ type: 'info', message, duration }),

  setGlobalLoading: (globalLoading) => set({ globalLoading }),
}));
