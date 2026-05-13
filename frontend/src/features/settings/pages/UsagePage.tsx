import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Building2,
  Trophy,
  Inbox,
  CalendarCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

import { settingsApi } from '@/api/settings.api';
import { cn } from '@/lib/cn';

export function UsagePage() {
  const q = useQuery({ queryKey: ['usage'], queryFn: settingsApi.usage });

  if (q.isLoading) {
    return <div className="text-sm text-ink-500">Carregando uso…</div>;
  }
  const u = q.data;
  if (!u) {
    return <div className="text-sm text-ink-500">Sem dados de uso.</div>;
  }

  const usersUsedPct = Math.min(
    100,
    Math.round((u.limits.users.used / Math.max(u.limits.users.max, 1)) * 100),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Usage</h1>
        <p className="mt-1 text-sm text-ink-600">
          Plano atual: <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700">{u.plan}</span>
        </p>
      </header>

      <section className="mb-6 rounded-xl border border-ink-200 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-ink-900">Usuários ativos</div>
            <div className="text-xs text-ink-500">Inclua sua equipe sem ultrapassar o plano.</div>
          </div>
          <div className="text-right text-sm font-bold text-ink-900">
            {u.limits.users.used} / {u.limits.users.max}
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-100">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              usersUsedPct >= 90
                ? 'bg-danger'
                : usersUsedPct >= 70
                ? 'bg-warning'
                : 'bg-brand-500',
            )}
            style={{ width: `${usersUsedPct}%` }}
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Counter icon={Users} label="Contatos" value={u.counts.contacts} />
        <Counter icon={Building2} label="Empresas" value={u.counts.companies} />
        <Counter icon={Trophy} label="Deals abertos" value={u.counts.deals.open} accent="brand" />
        <Counter
          icon={CheckCircle2}
          label="Deals ganhos"
          value={u.counts.deals.won}
          accent="success"
        />
        <Counter
          icon={XCircle}
          label="Deals perdidos"
          value={u.counts.deals.lost}
          accent="danger"
        />
        <Counter icon={CalendarCheck} label="Atividades" value={u.counts.activities} />
        <Counter icon={Inbox} label="Leads" value={u.counts.leads} />
      </section>
    </div>
  );
}

function Counter({
  icon: Icon,
  label,
  value,
  accent = 'brand',
}: {
  icon: any;
  label: string;
  value: number;
  accent?: 'brand' | 'success' | 'danger' | 'warning';
}) {
  const colors: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    success: 'bg-success/10 text-success',
    danger: 'bg-danger/10 text-danger',
    warning: 'bg-warning/15 text-warning',
  };
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
      <div className={cn('grid h-10 w-10 place-items-center rounded-lg', colors[accent])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900">{value}</div>
      <div className="text-sm font-medium text-ink-600">{label}</div>
    </div>
  );
}
