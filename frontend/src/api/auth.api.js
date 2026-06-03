import { api, unwrap } from '@/lib/api';
export const authApi = {
    register: async (payload) => unwrap(await api.post('/auth/register', payload)),
    login: async (payload) => unwrap(await api.post('/auth/login', payload)),
    verify2fa: async (email, code) => unwrap(await api.post('/auth/2fa/verify', { email, code })),
    resend2fa: async (email) => unwrap(await api.post('/auth/2fa/resend', { email })),
    // ---- TOTP no login ----
    totpVerifyLogin: async (token, code) => unwrap(await api.post('/auth/totp/verify', { token, code })),
    // ---- TOTP autenticado (Configurações) ----
    totpInit: async () => unwrap(await api.post('/auth/totp/init')),
    totpConfirm: async (code) => unwrap(await api.post('/auth/totp/confirm', { code })),
    totpDisable: async (code) => unwrap(await api.post('/auth/totp/disable', { code })),
    // ---- 2FA por e-mail ----
    emailOtpEnable: async () => unwrap(await api.post('/auth/email-2fa/enable')),
    emailOtpDisable: async () => unwrap(await api.post('/auth/email-2fa/disable')),
    me: async () => unwrap(await api.get('/auth/me')),
    logout: async () => unwrap(await api.post('/auth/logout')),
    forgotPassword: async (email) => unwrap(await api.post('/auth/forgot-password', { email })),
    resetPassword: async (token, password) => unwrap(await api.post('/auth/reset-password', { token, password })),
};
