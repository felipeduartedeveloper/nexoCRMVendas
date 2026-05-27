import { api, unwrap } from '@/lib/api';
import type { AuthUser } from '@/store/auth.store';

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  captchaToken?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  requires2fa?: boolean; // OTP por e-mail (e-mail não verificado)
  status?: 'TOTP_REQUIRED' | 'TOTP_SETUP_REQUIRED'; // 2FA por app autenticador
  totpToken?: string;
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

export interface TotpSecret {
  qrDataUrl: string;
  secret: string;
  otpauthUrl: string;
}

export const authApi = {
  register: async (payload: RegisterPayload) =>
    unwrap<AuthResponse>(await api.post('/auth/register', payload)),
  login: async (payload: LoginPayload) =>
    unwrap<AuthResponse>(await api.post('/auth/login', payload)),
  verify2fa: async (email: string, code: string) =>
    unwrap<AuthSession>(await api.post('/auth/2fa/verify', { email, code })),
  resend2fa: async (email: string) =>
    unwrap<{ message: string }>(await api.post('/auth/2fa/resend', { email })),

  // ---- TOTP no login ----
  totpVerifyLogin: async (token: string, code: string) =>
    unwrap<AuthSession>(await api.post('/auth/totp/verify', { token, code })),

  // ---- TOTP autenticado (Configurações) ----
  totpInit: async () => unwrap<TotpSecret>(await api.post('/auth/totp/init')),
  totpConfirm: async (code: string) =>
    unwrap<{ totpEnabled: boolean }>(await api.post('/auth/totp/confirm', { code })),
  totpDisable: async (code: string) =>
    unwrap<{ totpEnabled: boolean }>(await api.post('/auth/totp/disable', { code })),

  me: async () => unwrap<AuthUser>(await api.get('/auth/me')),
  logout: async () => unwrap(await api.post('/auth/logout')),
  forgotPassword: async (email: string) =>
    unwrap<{ message: string }>(await api.post('/auth/forgot-password', { email })),
  resetPassword: async (token: string, password: string) =>
    unwrap<{ message: string }>(
      await api.post('/auth/reset-password', { token, password }),
    ),
};
