import { useQuery } from '@tanstack/react-query';
import { CreditCard, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { settingsApi } from '@/api/settings.api';
import { cn } from '@/lib/cn';

const PLANS = [
  {
    code: 'ESSENTIAL',
    name: 'Essential',
    price: 'R$ 49 / usuário / mês',
    features: ['Pipeline ilimitado', 'Até 3 usuários', 'Importação CSV', 'Histórico de contatos'],
  },
  {
    code: 'ADVANCED',
    name: 'Advanced',
    price: 'R$ 89 / usuário / mês',
    features: ['Sales Inbox', 'Automações básicas', 'Até 10 usuários', 'Relatórios avançados'],
  },
  {
    code: 'PROFESSIONAL',
    name: 'Professional',
    highlight: true,
    price: 'R$ 149 / usuário / mês',
    features: ['Automações avançadas', 'Usuários ilimitados', 'API REST', 'Suporte prioritário'],
  },
  {
    code: 'POWER',
    name: 'Power',
    price: 'R$ 199 / usuário / mês',
    features: ['Tudo do Pro', 'Suporte 24/7', 'Custom fields ilimitados'],
  },
  {
    code: 'ENTERPRISE',
    name: 'Enterprise',
    price: 'Sob consulta',
    features: ['SSO/SAML', 'Auditoria avançada', 'SLA dedicado', 'Treinamento on-site'],
  },
];

export function BillingPage() {
  const q = useQuery({ queryKey: ['settings-org'], queryFn: settingsApi.currentOrg });
  const current = q.data?.plan ?? 'TRIAL';

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie seu plano e veja o histórico de cobrança.
        </p>
      </header>

      <section className="mb-6 rounded-xl border border-brand-200 bg-brand-50 p-5">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-brand-500 text-white">
            <CreditCard className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wide text-brand-700">
              Plano atual
            </div>
            <div className="text-xl font-extrabold text-foreground">{current}</div>
          </div>
          <Button variant="outline" size="sm">
            Histórico de faturas
          </Button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((p) => {
          const active = p.code === current;
          return (
            <div
              key={p.code}
              className={cn(
                'flex flex-col rounded-xl border bg-card p-6 shadow-card transition-shadow',
                active
                  ? 'border-brand-500 ring-2 ring-brand-100'
                  : p.highlight
                  ? 'border-brand-300'
                  : 'border-border hover:shadow-elevated',
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">{p.name}</h3>
                {active && (
                  <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-success">
                    Seu plano
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm font-semibold text-brand-700">{p.price}</div>
              <ul className="mt-4 space-y-1.5 text-sm text-foreground/80">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6"
                variant={active ? 'outline' : 'primary'}
                disabled={active}
              >
                {active ? 'Plano atual' : 'Selecionar plano'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
