import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth.store';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  timeout: 30_000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) return null;
    try {
      const resp = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );
      const data = resp.data?.data ?? resp.data;
      const accessToken = data?.accessToken as string | undefined;
      const newRefresh = data?.refreshToken as string | undefined;
      if (!accessToken) return null;
      useAuthStore.getState().setTokens({
        accessToken,
        refreshToken: newRefresh ?? refreshToken,
      });
      return accessToken;
    } catch {
      useAuthStore.getState().logout();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

api.interceptors.response.use(
  (resp) => resp,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
    // Paywall (trial expirado / sem assinatura) — leva o usuário para os planos.
    if (error.response?.status === 402 && !window.location.pathname.startsWith('/settings/billing')) {
      window.location.assign('/settings/billing');
    }
    if (
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !original.url?.includes('/auth/login') &&
      !original.url?.includes('/auth/refresh')
    ) {
      original._retried = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers?.set?.('Authorization', `Bearer ${newToken}`);
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

export function extractErrorMessage(err: unknown, fallback = 'Erro inesperado'): string {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;
    const msg = data?.message || data?.error?.message || data?.error;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export function unwrap<T = any>(payload: any): T {
  return payload?.data?.data ?? payload?.data ?? payload;
}
