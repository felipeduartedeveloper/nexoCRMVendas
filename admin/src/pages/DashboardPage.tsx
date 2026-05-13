import { Building2, Users, Trophy, TrendingUp } from 'lucide-react';

const kpis = [
  { label: 'Organizações ativas', value: 0, icon: Building2 },
  { label: 'Usuários totais', value: 1, icon: Users },
  { label: 'Deals criados', value: 0, icon: Trophy },
  { label: 'MRR (R$)', value: '0', icon: TrendingUp },
];

export function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
        Visão geral da plataforma
      </h1>
      <p className="mt-1 text-sm text-ink-600">
        Métricas agregadas de todas as organizações em CRM Vendas.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-ink-200 bg-white p-5 shadow-card"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <k.icon className="h-5 w-5" />
            </span>
            <div className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900">
              {k.value}
            </div>
            <div className="text-sm font-medium text-ink-600">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-ink-200 bg-white p-6 shadow-card">
        <h2 className="text-base font-bold text-ink-900">Próximos passos</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-700">
          <li>· Convide novos SUPER_ADMINs em Usuários</li>
          <li>· Configure planos e limites na seção Planos</li>
          <li>· Acompanhe atividades suspeitas na Trilha de auditoria</li>
        </ul>
      </div>
    </div>
  );
}
