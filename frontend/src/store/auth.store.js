import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useAuthStore = create()(persist((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isHydrated: false,
    setTokens: ({ accessToken, refreshToken }) => set((s) => ({ accessToken, refreshToken: refreshToken ?? s.refreshToken })),
    setUser: (user) => set({ user }),
    setSession: ({ user, accessToken, refreshToken }) => set({ user, accessToken, refreshToken }),
    logout: () => set({ user: null, accessToken: null, refreshToken: null }),
}), {
    name: 'crmvendas.auth',
    partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
    }),
    onRehydrateStorage: () => (state) => {
        if (state)
            state.isHydrated = true;
    },
}));
export const useIsAuthenticated = () => useAuthStore((s) => Boolean(s.accessToken && s.user));
