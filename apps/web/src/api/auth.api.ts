import api from '@/api/axiosInstance';
import type { ApiResponse, AuthResponse, User } from '@pathforge/shared-types';
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from '@pathforge/shared-zod';

// ─── Auth API ─────────────────────────────────────────────────────

export const authApi = {
  register: (data: RegisterInput) =>
    api.post<ApiResponse<{ userId: string; email: string }>>('/auth/register', data),

  login: (data: LoginInput) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout'),

  refreshToken: () =>
    api.post<ApiResponse<{ accessToken: string; expiresIn: number }>>('/auth/refresh-token'),

  forgotPassword: (data: ForgotPasswordInput) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordInput) =>
    api.post<ApiResponse<null>>('/auth/reset-password', data),

  verifyEmail: (token: string) =>
    api.get<ApiResponse<null>>(`/auth/verify-email?token=${token}`),
};
