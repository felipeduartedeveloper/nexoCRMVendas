import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Target,
  FileBarChart,
  Plus,
  TrendingUp,
  Search,
  Sparkles,
  Trophy,
  Users,
  Inbox,
  CalendarCheck,
} from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { settingsApi } from '@/api/settings.api';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';

type Section = 'dashboards' | 'goals' | 'reports';

const MENU: { value: Section; label: string; icon: any }[] = [
  { value: 'dashboards', label: 'My dashboards', icon: LayoutDashboard },
  { value: 'goals', label: 'Goals', icon: Target },
  { value: 'reports', label: 'My reports', icon: FileBarChart },
];

const SAMPLE_GOALS = [
  { label: 'Deals to win', current: 0, target: 10 },
  { label: 'Revenue this month', current: 0, target: 50000 },
  { label: 'Calls per week', current: 0, target: 50 },
  { label: 'New leads', current: 0, target: 100 },
];

const REPORT_TEMPLATES = [
  {
    icon: Trophy,
    title: 'Deals won by stage',
    desc: 'Performance de conversão por etapa do funil.',
  },
  {
    icon: TrendingUp,
    title: 'Pipeline value over time',
    desc: 'Valor total do pipeline mês a mês.',
  },
  {
    icon: Users,
    title: 'Sales by team member',
    desc: 'Ranking de vendedores por receita gerada.',
  },
  {
    icon: CalendarCheck,
    title: 'Activities completed',
    desc: 'Ligações, reuniões e tarefas concluídas no período.',
  },
  {
    icon: Inbox,
    title: 'Lead conversion rate',
    desc: 'Quantos leads viraram deals.',
  },
];

export function InsightsPage() {
  const [section, setSection] = useState<Section>('dashboards');
  const [search, setSearch] = useState('');
  const usageQ = useQuery({ queryKey: ['usage'], queryFn: settingsApi.usage });

  const totalGoals = 4;
  const completedGoals = 0;
  const goalProgress = Math.round((completedGoals / 250) * 100);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Insights"
        subtitle="Decisões guiadas por dados em tempo real."
        actions={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar em Insights…"
              className="h-9 w-64 rounded-lg border border-border bg-card pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border border-border bg-card p-3 shadow-card">
          <ul className="space-y-0.5">
            {MENU.map((it) => (
              <li key={it.value}>
                <button
                  type="button"
                  onClick={() => setSection(it.value)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    section === it.value
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-foreground/80 hover:bg-muted',
                  )}
                >
                  <it.icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{it.label}</span>
                  {it.value === 'dashboards' && (
                    <span className="text-[10px] text-muted-foreground">No dashboards</span>
                  )}
                  {it.value === 'goals' && (
                    <span className="text-[10px] text-muted-foreground">
                      {completedGoals}/250
                    </span>
                  )}
                  {it.value === 'reports' && (
                    <span className="text-[10px] text-muted-foreground">No reports</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="min-w-0">
          {section === 'dashboards' && (
            <DashboardsSection usage={usageQ.data} />
          )}
          {section === 'goals' && <GoalsSection progress={goalProgress} />}
          {section === 'reports' && <ReportsSection />}
        </main>
      </div>
    </div>
  );
}

function DashboardsSection({ usage }: { usage: any }) {
  const open = usage?.counts?.deals?.open ?? 0;
  const won = usage?.counts?.deals?.won ?? 0;
  const lost = usage?.counts?.deals?.lost ?? 0;
  const winRate = won + lost === 0 ? 0 : Math.round((won / (won + lost)) * 100);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
        <span className="grid h-14 w-14 mx-auto place-items-center rounded-xl bg-brand-100 text-brand-700">
          <Sparkles className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-2xl font-extrabold text-foreground">
          Identify growth opportunities. Take action.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Set up your personalized, customizable reporting dashboard. Track oxlify data
          related to your sales activities. Make informed decisions at the right time.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button>
            <Plus className="h-4 w-4" /> Create your first dashboard
          </Button>
          <Button variant="outline">Use a template</Button>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-base font-bold text-foreground">Snapshot do funil</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={Trophy} label="Deals abertos" value={String(open)} />
          <Kpi
            icon={TrendingUp}
            label="Win rate"
            value={`${winRate}%`}
            accent="success"
          />
          <Kpi
            icon={Users}
            label="Contatos"
            value={String(usage?.counts?.contacts ?? 0)}
          />
          <Kpi
            icon={Inbox}
            label="Leads"
            value={String(usage?.counts?.leads ?? 0)}
          />
        </div>
      </section>
    </div>
  );
}

function GoalsSection({ progress }: { progress: number }) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-8 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">Goals</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Defina metas pessoais e do time. Acompanhe progresso em tempo real.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4" /> Nova meta
          </Button>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <div className="text-3xl font-extrabold tracking-tight text-brand-700">
            0/250
          </div>
          <div className="flex-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Metas concluídas neste período
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-base font-bold text-foreground">Metas sugeridas</h3>
        <ul className="grid gap-3 md:grid-cols-2">
          {SAMPLE_GOALS.map((g) => (
            <li
              key={g.label}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-card"
            >
              <div>
                <div className="font-semibold text-foreground">{g.label}</div>
                <div className="text-xs text-muted-foreground">
                  {g.current} / {g.target}
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ReportsSection() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
        <FileBarChart className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-3 text-xl font-extrabold text-foreground">
          You have no reports yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Build relatórios customizados a partir dos seus dados de vendas. Escolha um
          template abaixo ou comece do zero.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button>
            <Plus className="h-4 w-4" /> Create your first report
          </Button>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-base font-bold text-foreground">Templates populares</h3>
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {REPORT_TEMPLATES.map((t) => (
            <li
              key={t.title}
              className="rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-elevated"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <t.icon className="h-5 w-5" />
              </span>
              <h4 className="mt-3 font-bold text-foreground">{t.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              <button
                type="button"
                className="mt-3 text-xs font-bold text-brand-600 hover:underline"
              >
                Usar template →
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  accent = 'brand',
}: {
  icon: any;
  label: string;
  value: string;
  accent?: 'brand' | 'success';
}) {
  const colors: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    success: 'bg-success/10 text-success',
  };
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className={cn('grid h-10 w-10 place-items-center rounded-lg', colors[accent])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-2xl font-extrabold tracking-tight text-foreground">
        {value}
      </div>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
    </div>
  );
}
