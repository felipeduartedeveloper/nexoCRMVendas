import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'SALES' | 'VIEWER';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string | null;
  emailVerified: boolean;
  totpEnabled?: boolean;
  avatarUrl?: string | null;
  locale?: string;
  timezone?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setTokens: (t: { accessToken: string; refreshToken?: string }) => void;
  setUser: (u: AuthUser | null) => void;
  setSession: (s: { user: AuthUser; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isHydrated: false,
      setTokens: ({ accessToken, refreshToken }) =>
        set((s) => ({ accessToken, refreshToken: refreshToken ?? s.refreshToken })),
      setUser: (user) => set({ user }),
      setSession: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'crmvendas.auth',
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    },
  ),
);

export const useIsAuthenticated = () =>
  useAuthStore((s) => Boolean(s.accessToken && s.user));
