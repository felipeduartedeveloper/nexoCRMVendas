import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Shield } from 'lucide-react';

import { useAuthStore } from '@/store/auth.store';

export function Topbar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', handle);
    return () => document.removeEventListener('click', handle);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
          <Shield className="h-3.5 w-3.5" /> SUPER_ADMIN
        </span>
      </div>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg p-1.5 pr-2 hover:bg-ink-100"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
            {(user?.name ?? 'SA').slice(0, 2).toUpperCase()}
          </span>
          <ChevronDown className="h-4 w-4 text-ink-500" />
        </button>
        {open && (
          <div className="absolute right-0 top-12 z-30 w-60 rounded-xl border border-ink-200 bg-white p-2 shadow-elevated">
            <div className="border-b border-ink-100 px-3 py-2">
              <div className="truncate font-semibold text-ink-900">{user?.name}</div>
              <div className="truncate text-xs text-ink-500">{user?.email}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
