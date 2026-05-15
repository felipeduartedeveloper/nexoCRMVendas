import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Search, Bell, Plus, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';

export function Topbar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('click', handle);
    return () => document.removeEventListener('click', handle);
  }, []);

  const logoutM = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logoutStore();
      toast.success('Sessão encerrada.');
      navigate('/login');
    },
  });

  const initials = (user?.name ?? 'CV')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative flex w-full max-w-md items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground/70" />
          <input
            type="search"
            placeholder="Pesquisar contatos, deals, atividades…"
            className="h-10 w-full rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-brand-500 focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="md" className="hidden md:inline-flex">
          <Plus className="h-4 w-4" /> Novo
        </Button>

        <ThemeToggle />

        <button
          type="button"
          className="relative grid h-10 w-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg p-1.5 pr-2 hover:bg-muted"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {initials}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-12 z-30 w-64 rounded-xl border border-border bg-card p-2 shadow-elevated">
              <div className="border-b border-border/50 px-3 py-2">
                <div className="truncate font-semibold text-foreground">{user?.name}</div>
                <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
                <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                  {user?.role}
                </span>
              </div>
              <MenuItem icon={User} label="Meu perfil" onClick={() => navigate('/profile')} />
              <MenuItem icon={Settings} label="Configurações" onClick={() => navigate('/settings')} />
              <div className="my-1 h-px bg-muted" />
              <MenuItem
                icon={LogOut}
                label="Sair"
                danger
                onClick={() => logoutM.mutate()}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuItem({
  icon: Icon,
  label,
  danger,
  onClick,
}: {
  icon: any;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ' +
        (danger
          ? 'text-danger hover:bg-danger/10'
          : 'text-foreground/90 hover:bg-muted')
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
