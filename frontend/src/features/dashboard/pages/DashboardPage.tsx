import { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Plus,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuthStore } from '@/store/auth.store';

const kpis = [
  { label: 'Deals abertos', value: 1, hint: '+1 esta semana', icon: Trophy, color: 'brand' },
  { label: 'Valor do pipeline', value: 'R$ 30.000', hint: 'em 1 deal', icon: TrendingUp, color: 'success' },
  { label: 'Atividades hoje', value: 2, hint: 'a vencer hoje', icon: CalendarCheck, color: 'warning' },
  { label: 'Novos contatos', value: 2, hint: 'esta semana', icon: Users, color: 'brand' },
];

const activities = [
  {
    icon: Phone,
    title: 'Final attempt — Tony Turner',
    when: 'Hoje · 10:00',
    badge: 'Ligação',
  },
  {
    icon: Calendar,
    title: 'Context call — MoveEr',
    when: 'Amanhã · 14:30',
    badge: 'Reunião',
  },
  {
    icon: Mail,
    title: 'Enviar proposta para MoveEr',
    when: 'Sexta · 09:00',
    badge: 'E-mail',
  },
];

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = (user?.name ?? '').split(' ')[0] || 'time';

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={`Bem-vindo de volta, ${firstName} 👋`}
        subtitle="Aqui está um resumo do seu pipeline hoje."
        actions={
          <>
            <Link to="/setup-guide">
              <Button variant="outline">
                <CheckCircle2 className="h-4 w-4" /> Guia de configuração
              </Button>
            </Link>
            <Link to="/deals/new">
              <Button>
                <Plus className="h-4 w-4" /> Novo negócio
              </Button>
            </Link>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-border bg-card p-5 shadow-card"
          >
            <div className="flex items-center justify-between">
              <span
                className={
                  'grid h-10 w-10 place-items-center rounded-lg ' +
                  (k.color === 'success'
                    ? 'bg-success/10 text-success'
                    : k.color === 'warning'
                    ? 'bg-warning/15 text-warning'
                    : 'bg-brand-50 text-brand-600')
                }
              >
                <k.icon className="h-5 w-5" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground/70" />
            </div>
            <div className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
              {k.value}
            </div>
            <div className="text-sm font-medium text-muted-foreground">{k.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{k.hint}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Pipeline preview */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Pipeline · Vendas (padrão)</h2>
            <Link
              to="/deals"
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              Ver pipeline →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['Novo deal', 'Contato feito', 'Qualificado'].map((label, idx) => (
              <div key={label} className="rounded-lg bg-muted/40 p-3">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  {label}
                </div>
                {idx === 1 ? (
                  <div className="rounded-lg border border-border bg-card p-3 shadow-card">
                    <div className="text-sm font-semibold text-foreground">
                      [Sample] Tony Turner / MoveEr
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">Tony Turner</div>
                    <span className="mt-2 inline-flex rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
                      £ 30.000
                    </span>
                  </div>
                ) : (
                  <div className="grid h-20 place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground/70">
                    Arraste um deal aqui
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Próximas atividades</h2>
            <Link
              to="/activities"
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              Ver todas →
            </Link>
          </div>
          <ul className="space-y-2">
            {activities.map((a) => (
              <li key={a.title} className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <a.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {a.title}
                  </div>
                  <div className="text-xs text-muted-foreground">{a.when}</div>
                </div>
                <span className="hidden rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/80 sm:inline">
                  {a.badge}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
