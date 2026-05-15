import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Users,
  Trophy,
  Mail,
  Settings,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

const goals = [
  {
    key: 'pipeline',
    icon: Trophy,
    title: 'Configure seu pipeline',
    desc: 'Defina as etapas do seu funil de vendas para começar a acompanhar negócios.',
    tasks: [
      { label: 'Pipeline padrão criado', done: true },
      { label: 'Personalizar etapas', done: false, to: '/settings/pipelines' },
      { label: 'Criar seu primeiro deal', done: false, to: '/deals/new' },
    ],
  },
  {
    key: 'contacts',
    icon: Users,
    title: 'Importe seus contatos',
    desc: 'Traga contatos da sua planilha ou conecte com fontes existentes.',
    tasks: [
      { label: 'Adicionar contatos manualmente', done: false, to: '/contacts' },
      { label: 'Importar CSV / XLSX', done: false, to: '/contacts?import=1' },
      { label: 'Conectar Google Contacts', done: false, to: '/integrations' },
    ],
  },
  {
    key: 'inbox',
    icon: Mail,
    title: 'Conecte sua caixa de e-mails',
    desc: 'Sincronize e-mails enviados e recebidos com os deals automaticamente.',
    tasks: [
      { label: 'Conectar Gmail', done: false, to: '/sales-inbox/connect' },
      { label: 'Definir assinatura padrão', done: false, to: '/settings/email' },
    ],
  },
  {
    key: 'team',
    icon: Settings,
    title: 'Convide seu time',
    desc: 'Adicione vendedores, gerentes e defina permissões.',
    tasks: [
      { label: 'Convidar pessoas', done: false, to: '/settings/users' },
      { label: 'Definir papéis e permissões', done: false, to: '/settings/permissions' },
    ],
  },
];

export function SetupGuidePage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState<string | null>(goals[0].key);

  const totalDone = goals.reduce(
    (acc, g) => acc + g.tasks.filter((t) => t.done).length,
    0,
  );
  const totalTasks = goals.reduce((acc, g) => acc + g.tasks.length, 0);
  const progress = Math.round((totalDone / totalTasks) * 100);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Guia de configuração"
        subtitle="Comece pelas tarefas essenciais. Em ~5 minutos seu CRM estará pronto."
        actions={
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Pular para o dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        }
      />

      <div className="mb-6 rounded-xl border border-brand-100 bg-brand-50/60 p-5">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-brand-500 text-white">
            <Compass className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <div className="font-bold text-foreground">Seu progresso</div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-xs font-medium text-brand-800">
              {totalDone} de {totalTasks} tarefas concluídas · {progress}%
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {goals.map((g) => {
          const isOpen = open === g.key;
          const done = g.tasks.filter((t) => t.done).length;
          return (
            <div
              key={g.key}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : g.key)}
                className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-muted/40"
              >
                <span
                  className={cn(
                    'grid h-12 w-12 place-items-center rounded-lg',
                    done === g.tasks.length
                      ? 'bg-success/10 text-success'
                      : 'bg-brand-50 text-brand-600',
                  )}
                >
                  {done === g.tasks.length ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <g.icon className="h-6 w-6" />
                  )}
                </span>
                <div className="flex-1">
                  <div className="font-bold text-foreground">{g.title}</div>
                  <div className="text-sm text-muted-foreground">{g.desc}</div>
                </div>
                <span className="hidden text-xs font-semibold text-muted-foreground sm:inline">
                  {done}/{g.tasks.length}
                </span>
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground/70" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground/70" />
                )}
              </button>

              {isOpen && (
                <ul className="border-t border-border/50 p-3">
                  {g.tasks.map((t) => (
                    <li key={t.label} className="flex items-center gap-3 p-2">
                      <span
                        className={
                          'grid h-5 w-5 place-items-center rounded-full border ' +
                          (t.done
                            ? 'border-success bg-success text-white'
                            : 'border-border bg-card')
                        }
                      >
                        {t.done && <CheckCircle2 className="h-3 w-3" />}
                      </span>
                      <span
                        className={
                          'flex-1 text-sm ' +
                          (t.done
                            ? 'text-muted-foreground/70 line-through'
                            : 'text-foreground/90')
                        }
                      >
                        {t.label}
                      </span>
                      {!t.done && t.to && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(t.to!)}
                        >
                          Fazer agora
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
