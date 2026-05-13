import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  Flag,
  Utensils,
  ClipboardList,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { CalendarSyncBanner } from '../components/CalendarSyncBanner';
import { NewActivityModal } from '../components/NewActivityModal';
import { activitiesApi, type Activity, type ActivityType } from '@/api/activities.api';
import { extractErrorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';

const TYPE_META: Record<ActivityType, { label: string; icon: any; color: string }> = {
  CALL: { label: 'Ligação', icon: Phone, color: 'bg-blue-100 text-blue-700' },
  MEETING: { label: 'Reunião', icon: Calendar, color: 'bg-purple-100 text-purple-700' },
  TASK: { label: 'Tarefa', icon: CheckSquare, color: 'bg-green-100 text-green-700' },
  DEADLINE: { label: 'Prazo', icon: Flag, color: 'bg-red-100 text-red-700' },
  EMAIL: { label: 'E-mail', icon: Mail, color: 'bg-cyan-100 text-cyan-700' },
  LUNCH: { label: 'Almoço', icon: Utensils, color: 'bg-amber-100 text-amber-700' },
};

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: 'text-danger',
  MEDIUM: 'text-warning',
  LOW: 'text-ink-400',
};

const SCOPES = [
  { value: 'all', label: 'Todas' },
  { value: 'overdue', label: 'Atrasadas' },
  { value: 'today', label: 'Hoje' },
  { value: 'upcoming', label: 'Próximas' },
] as const;

function formatDateCell(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export function ActivitiesPage() {
  const qc = useQueryClient();
  const [scope, setScope] = useState<(typeof SCOPES)[number]['value']>('all');
  const [search, setSearch] = useState('');
  const [doneFilter, setDoneFilter] = useState<'all' | 'done' | 'open'>('all');
  const [showNew, setShowNew] = useState(false);

  const q = useQuery({
    queryKey: ['activities', { scope, search, doneFilter }],
    queryFn: () =>
      activitiesApi.list({
        scope: scope as any,
        search: search || undefined,
        done: doneFilter === 'all' ? undefined : doneFilter === 'done',
        limit: 200,
      }),
  });

  const counters = useQuery({
    queryKey: ['activities-counters'],
    queryFn: activitiesApi.counters,
  });

  const toggleDone = useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) => activitiesApi.markDone(id, done),
    onMutate: async ({ id, done }) => {
      await qc.cancelQueries({ queryKey: ['activities'] });
      const prev = qc.getQueryData<any>(['activities', { scope, search, doneFilter }]);
      qc.setQueryData<any>(['activities', { scope, search, doneFilter }], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((a: Activity) => (a.id === id ? { ...a, done } : a)),
        };
      });
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['activities', { scope, search, doneFilter }], ctx.prev);
      toast.error(extractErrorMessage(err, 'Falha ao atualizar.'));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['activities-counters'] });
    },
  });

  const items = q.data?.items ?? [];
  const totalCount = q.data?.total ?? 0;

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Atividades"
        subtitle={`${totalCount} atividades · ligações, reuniões, tarefas e prazos`}
        actions={
          <Button onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" /> Nova atividade
          </Button>
        }
      />

      <CalendarSyncBanner />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Counter label="Atrasadas" value={counters.data?.overdue ?? 0} color="text-danger" />
        <Counter label="Hoje" value={counters.data?.today ?? 0} color="text-warning" />
        <Counter label="Próximas" value={counters.data?.upcoming ?? 0} color="text-brand-600" />
        <Counter label="Concluídas" value={counters.data?.done ?? 0} color="text-success" />
      </div>

      <div className="rounded-xl border border-ink-200 bg-white shadow-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-200 p-3">
          <div className="relative flex w-full max-w-sm items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por assunto…"
              className="h-9 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-ink-200 bg-ink-50 p-1">
            {SCOPES.map((s) => (
              <button
                key={s.value}
                onClick={() => setScope(s.value)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                  scope === s.value
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-ink-600 hover:text-ink-900',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-ink-200 bg-ink-50 p-1">
            {['all', 'open', 'done'].map((v) => (
              <button
                key={v}
                onClick={() => setDoneFilter(v as any)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                  doneFilter === v
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-ink-600 hover:text-ink-900',
                )}
              >
                {v === 'all' ? 'Todas' : v === 'open' ? 'Em aberto' : 'Concluídas'}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="ml-auto">
            <Filter className="h-4 w-4" /> Mais filtros
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50 text-left text-[11px] font-bold uppercase tracking-wide text-ink-500">
                <th className="w-10 px-4 py-2.5">Done</th>
                <th className="px-4 py-2.5">Subject</th>
                <th className="px-4 py-2.5">Deal</th>
                <th className="px-4 py-2.5">Priority</th>
                <th className="px-4 py-2.5">Contact person</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Phone</th>
                <th className="px-4 py-2.5">Organization</th>
                <th className="px-4 py-2.5">Due date</th>
                <th className="px-4 py-2.5">Duration</th>
                <th className="px-4 py-2.5">Assigned to</th>
              </tr>
            </thead>
            <tbody>
              {q.isLoading ? (
                <tr>
                  <td colSpan={11} className="p-12 text-center text-ink-500">
                    Carregando atividades…
                  </td>
                </tr>
              ) : !items.length ? (
                <tr>
                  <td colSpan={11} className="p-12 text-center">
                    <ClipboardList className="mx-auto mb-2 h-8 w-8 text-ink-300" />
                    <p className="text-sm text-ink-500">
                      Nenhuma atividade nesse filtro.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((a) => {
                  const meta = TYPE_META[a.type];
                  return (
                    <tr
                      key={a.id}
                      className={cn(
                        'border-b border-ink-100 hover:bg-brand-50/40',
                        a.done && 'bg-ink-50/60',
                      )}
                    >
                      <td className="px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={a.done}
                          onChange={(e) => toggleDone.mutate({ id: a.id, done: e.target.checked })}
                          className="h-4 w-4 cursor-pointer rounded border-ink-300 text-brand-600 focus:ring-brand-300"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'grid h-7 w-7 place-items-center rounded-lg',
                              meta.color,
                            )}
                          >
                            <meta.icon className="h-3.5 w-3.5" />
                          </span>
                          <span
                            className={cn(
                              'truncate font-semibold text-ink-900',
                              a.done && 'text-ink-400 line-through',
                            )}
                          >
                            {a.subject}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-ink-600">
                        {a.dealId ? (
                          <span className="rounded bg-ink-100 px-2 py-0.5 font-mono text-[11px]">
                            {a.dealId.slice(0, 8)}…
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-xs font-semibold',
                            PRIORITY_COLOR[a.priority],
                          )}
                        >
                          <Flag className="h-3 w-3" />
                          {a.priority === 'HIGH' ? 'Alta' : a.priority === 'MEDIUM' ? 'Média' : 'Baixa'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-ink-600">
                        {a.contactId ? (
                          <span className="font-mono text-[11px]">{a.contactId.slice(0, 8)}…</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-ink-600">—</td>
                      <td className="px-4 py-2.5 text-ink-600">—</td>
                      <td className="px-4 py-2.5 text-ink-600">
                        {a.orgCompanyId ? (
                          <span className="font-mono text-[11px]">{a.orgCompanyId.slice(0, 8)}…</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-ink-700">{formatDateCell(a.dueAt)}</td>
                      <td className="px-4 py-2.5 text-ink-700">{a.durationMin} min</td>
                      <td className="px-4 py-2.5 text-ink-600">
                        {a.ownerUserId ? (
                          <span className="font-mono text-[11px]">{a.ownerUserId.slice(0, 8)}…</span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewActivityModal open={showNew} onClose={() => setShowNew(false)} />
    </div>
  );
}

function Counter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-card">
      <div className={cn('text-2xl font-extrabold tracking-tight', color)}>{value}</div>
      <div className="text-xs font-medium text-ink-500">{label}</div>
    </div>
  );
}
