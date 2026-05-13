import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth.store';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({ baseURL: BASE_URL, timeout: 30_000 });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  },
);

export function extractErrorMessage(err: unknown, fallback = 'Erro inesperado'): string {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;
    const msg = data?.message || data?.error?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export function unwrap<T = any>(payload: any): T {
  return payload?.data?.data ?? payload?.data ?? payload;
}
