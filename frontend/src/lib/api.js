import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: false,
    timeout: 30_000,
});
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
});
let refreshInFlight = null;
async function refreshAccessToken() {
    if (refreshInFlight)
        return refreshInFlight;
    refreshInFlight = (async () => {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken)
            return null;
        try {
            const resp = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken }, { headers: { 'Content-Type': 'application/json' } });
            const data = resp.data?.data ?? resp.data;
            const accessToken = data?.accessToken;
            const newRefresh = data?.refreshToken;
            if (!accessToken)
                return null;
            useAuthStore.getState().setTokens({
                accessToken,
                refreshToken: newRefresh ?? refreshToken,
            });
            return accessToken;
        }
        catch {
            useAuthStore.getState().logout();
            return null;
        }
        finally {
            refreshInFlight = null;
        }
    })();
    return refreshInFlight;
}
api.interceptors.response.use((resp) => resp, async (error) => {
    const original = error.config;
    // Paywall (trial expirado / sem assinatura) — leva o usuário para os planos.
    if (error.response?.status === 402 && !window.location.pathname.startsWith('/settings/billing')) {
        window.location.assign('/settings/billing');
    }
    if (error.response?.status === 401 &&
        original &&
        !original._retried &&
        !original.url?.includes('/auth/login') &&
        !original.url?.includes('/auth/refresh')) {
        original._retried = true;
        const newToken = await refreshAccessToken();
        if (newToken) {
            original.headers?.set?.('Authorization', `Bearer ${newToken}`);
            return api(original);
        }
    }
    return Promise.reject(error);
});
export function extractErrorMessage(err, fallback = 'Erro inesperado') {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        const msg = data?.message || data?.error?.message || data?.error;
        if (Array.isArray(msg))
            return msg.join(', ');
        if (typeof msg === 'string')
            return msg;
    }
    if (err instanceof Error)
        return err.message;
    return fallback;
}
export function unwrap(payload) {
    return payload?.data?.data ?? payload?.data ?? payload;
}
