import { create } from 'zustand';
import { persist } from 'zustand/middleware';
function apply(theme) {
    const html = document.documentElement;
    if (theme === 'dark')
        html.classList.add('dark');
    else
        html.classList.remove('dark');
}
export const useThemeStore = create()(persist((set, get) => ({
    theme: 'light',
    setTheme: (t) => {
        apply(t);
        set({ theme: t });
    },
    toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        apply(next);
        set({ theme: next });
    },
}), {
    name: 'oxlify-theme',
    onRehydrateStorage: () => (state) => {
        if (state)
            apply(state.theme);
    },
}));
export function initTheme() {
    try {
        const raw = localStorage.getItem('oxlify-theme');
        const t = (raw && JSON.parse(raw)?.state?.theme);
        apply(t === 'dark' ? 'dark' : 'light');
    }
    catch {
        apply('light');
    }
}
