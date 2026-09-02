import api from '@/api/axiosInstance';
import type { ApiResponse, User } from '@pathforge/shared-types';
import type { UpdateProfileInput, UpdatePreferencesInput, ChangePasswordInput } from '@pathforge/shared-zod';

// ─── User API ─────────────────────────────────────────────────────

export const userApi = {
  getMe: () =>
    api.get<ApiResponse<User>>('/users/me'),

  updateProfile: (data: UpdateProfileInput) =>
    api.put<ApiResponse<User>>('/users/profile', data),

  updatePreferences: (data: UpdatePreferencesInput) =>
    api.put<ApiResponse<User>>('/users/preferences', data),

  changePassword: (data: ChangePasswordInput) =>
    api.put<ApiResponse<null>>('/users/change-password', data),

  deleteAccount: () =>
    api.delete<ApiResponse<null>>('/users/delete'),
};
