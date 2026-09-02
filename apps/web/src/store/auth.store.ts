import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { User } from '@pathforge/shared-types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  loginSuccess: (user: User, accessToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

/**
 * Auth Zustand store.
 * - Access token is stored in memory (NOT localStorage) for security.
 * - User data is persisted in sessionStorage (cleared on tab close).
 * - Refresh token is stored in an httpOnly cookie (managed by browser).
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: true }),

      setAccessToken: (accessToken) => set({ accessToken }),

      loginSuccess: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true, isLoading: false }),

      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'pathforge-auth',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist user data, NOT the access token (security)
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    },
  ),
);
