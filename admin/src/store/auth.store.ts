import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'SALES' | 'VIEWER';
}

interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (s: { user: AdminUser; accessToken: string; refreshToken: string }) => void;
  setTokens: (t: { accessToken: string; refreshToken?: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken }),
      setTokens: ({ accessToken, refreshToken }) =>
        set((s) => ({ accessToken, refreshToken: refreshToken ?? s.refreshToken })),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'crmvendas.admin.auth' },
  ),
);
