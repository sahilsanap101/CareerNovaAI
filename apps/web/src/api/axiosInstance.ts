import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

import { useAuthStore } from '@/store/auth.store';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

/**
 * Axios instance for all API calls.
 * - Automatically attaches Bearer token from Zustand store.
 * - On 401, clears auth state (auto-logout).
 * - Credentials: true so httpOnly refresh token cookie is sent.
 */
export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  withCredentials: true, // Required for httpOnly refresh token cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor — Attach Access Token ────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response Interceptor — Handle 401 ───────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid infinite loop on refresh endpoint itself
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token as string}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post<{ data: { accessToken: string } }>('/auth/refresh-token');
        const newToken = res.data.data?.accessToken;

        if (newToken) {
          useAuthStore.getState().setAccessToken(newToken);
          processQueue(null, newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
