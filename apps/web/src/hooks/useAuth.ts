import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { authApi } from '@/api/auth.api';
import { userApi } from '@/api/user.api';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { APP_ROUTES } from '@pathforge/shared-constants';
import type { LoginInput, RegisterInput } from '@pathforge/shared-zod';

export const AUTH_QUERY_KEY = ['auth', 'me'] as const;

/**
 * useAuth hook — primary interface for all auth operations.
 */
export function useAuth() {
  const { user, accessToken, isAuthenticated, isLoading } = useAuthStore();
  const { loginSuccess, logout: storeLogout, setLoading } = useAuthStore();
  const { showSuccess, showError } = useUiStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ─── Register ───────────────────────────────────────────────────
  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: () => {
      showSuccess('Account created! Please check your email to verify your account.');
      void navigate(APP_ROUTES.LOGIN);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showError(msg ?? 'Registration failed. Please try again.');
    },
  });

  // ─── Login ──────────────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (response) => {
      const { user: userData, accessToken: token } = response.data.data!;
      loginSuccess(userData as Parameters<typeof loginSuccess>[0], token);
      showSuccess('Welcome back!');
      void navigate(APP_ROUTES.DASHBOARD);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showError(msg ?? 'Login failed. Please check your credentials.');
    },
  });

  // ─── Logout ─────────────────────────────────────────────────────
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      storeLogout();
      queryClient.clear();
      void navigate(APP_ROUTES.LOGIN);
    },
  });

  return {
    // State
    user,
    accessToken,
    isAuthenticated,
    isLoading,

    // Mutations
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,

    // Loading states
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
