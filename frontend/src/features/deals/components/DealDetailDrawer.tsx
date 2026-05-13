import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Activity as ActivityIcon,
  Mail,
  StickyNote,
  Paperclip,
  Trophy,
  XCircle,
  Trash2,
  Calendar,
} from 'lucide-react';

import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { dealsApi, type Deal } from '@/api/deals.api';
import { activitiesApi } from '@/api/activities.api';
import type { Pipeline } from '@/api/pipelines.api';
import { formatMoney } from '@/lib/format';
import { extractErrorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';

type Tab = 'activities' | 'notes' | 'email' | 'files';

const TABS: { value: Tab; label: string; icon: any }[] = [
  { value: 'activities', label: 'Atividades', icon: ActivityIcon },
  { value: 'notes', label: 'Notas', icon: StickyNote },
  { value: 'email', label: 'E-mails', icon: Mail },
  { value: 'files', label: 'Arquivos', icon: Paperclip },
];

interface Props {
  open: boolean;
  dealId: string | null;
  pipeline: Pipeline | null;
  onClose: () => void;
}

export function DealDetailDrawer({ open, dealId, pipeline, onClose }: Props) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('activities');
  const [editTitle, setEditTitle] = useState('');
  const [editValue, setEditValue] = useState('');

  const dealQ = useQuery({
    queryKey: ['deal', dealId],
    queryFn: () => dealsApi.one(dealId!),
    enabled: open && !!dealId,
  });

  const activitiesQ = useQuery({
    queryKey: ['deal-activities', dealId],
    queryFn: () => activitiesApi.list({ dealId: dealId!, limit: 50 }),
    enabled: open && !!dealId && tab === 'activities',
  });

  useEffect(() => {
    if (dealQ.data) {
      setEditTitle(dealQ.data.title);
      setEditValue(String(dealQ.data.value));
    }
  }, [dealQ.data?.id]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Deal>) => dealsApi.update(dealId!, data),
    onSuccess: async () => {
      toast.success('Salvo!');
      await qc.invalidateQueries({ queryKey: ['deal', dealId] });
      if (pipeline?.id) {
        await qc.invalidateQueries({ queryKey: ['deals', 'kanban', pipeline.id] });
        await qc.invalidateQueries({ queryKey: ['deals-summary', pipeline.id] });
      }
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Falha ao salvar.')),
  });

  const winMutation = useMutation({
    mutationFn: () => dealsApi.win(dealId!),
    onSuccess: async () => {
      toast.success('Deal marcado como ganho!');
      await refreshAll();
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const loseMutation = useMutation({
    mutationFn: (reason?: string) => dealsApi.lose(dealId!, reason),
    onSuccess: async () => {
      toast('Deal marcado como perdido.');
      await refreshAll();
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => dealsApi.remove(dealId!),
    onSuccess: async () => {
      toast.success('Deal removido.');
      onClose();
      await refreshAll();
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  async function refreshAll() {
    if (pipeline?.id) {
      await qc.invalidateQueries({ queryKey: ['deals', 'kanban', pipeline.id] });
      await qc.invalidateQueries({ queryKey: ['deals-summary', pipeline.id] });
    }
    await qc.invalidateQueries({ queryKey: ['deal', dealId] });
  }

  const deal = dealQ.data;
  const stage = deal && pipeline?.stages.find((s) => s.id === deal.stageId);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="lg"
      title={deal ? deal.title : 'Carregando…'}
      subtitle={
        deal && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-success">
              {formatMoney(deal.value, deal.currency)}
            </span>
            {stage && (
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                {stage.name}
              </span>
            )}
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide',
                deal.status === 'WON'
                  ? 'bg-success/10 text-success'
                  : deal.status === 'LOST'
                  ? 'bg-danger/10 text-danger'
                  : deal.status === 'DELETED'
                  ? 'bg-ink-100 text-ink-500'
                  : 'bg-ink-100 text-ink-700',
              )}
            >
              {deal.status}
            </span>
          </div>
        )
      }
      headerActions={
        deal &&
        deal.status === 'OPEN' && (
          <div className="flex items-center gap-1">
            <Button size="sm" onClick={() => winMutation.mutate()} loading={winMutation.isPending}>
              <Trophy className="h-4 w-4" /> Ganhei
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const reason = window.prompt('Motivo da perda? (opcional)');
                if (reason !== null) loseMutation.mutate(reason || undefined);
              }}
              loading={loseMutation.isPending}
            >
              <XCircle className="h-4 w-4" /> Perdi
            </Button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Apagar este negócio?')) deleteMutation.mutate();
              }}
              className="grid h-8 w-8 place-items-center rounded-lg text-danger hover:bg-red-50"
              aria-label="Apagar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      }
    >
      {!deal ? (
        <div className="p-8 text-center text-sm text-ink-500">Carregando…</div>
      ) : (
        <div>
          <div className="space-y-4 border-b border-ink-200 p-5">
            <Input
              label="Título"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => {
                if (editTitle && editTitle !== deal.title) {
                  updateMutation.mutate({ title: editTitle });
                }
              }}
            />
            <Input
              label={`Valor (${deal.currency})`}
              type="number"
              min={0}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => {
                const v = Number(editValue);
                if (Number.isFinite(v) && v !== Number(deal.value)) {
                  updateMutation.mutate({ value: v });
                }
              }}
            />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Pipeline">{pipeline?.name ?? '—'}</Field>
              <Field label="Etapa">{stage?.name ?? '—'}</Field>
              <Field label="Criado">
                {new Date(deal.createdAt).toLocaleString('pt-BR')}
              </Field>
              <Field label="Atualizado">
                {new Date(deal.updatedAt).toLocaleString('pt-BR')}
              </Field>
            </div>
          </div>

          <nav className="flex border-b border-ink-200" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.value}
                role="tab"
                aria-selected={tab === t.value}
                onClick={() => setTab(t.value)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors',
                  tab === t.value
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-ink-600 hover:text-ink-900',
                )}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </nav>

          <div className="p-5">
            {tab === 'activities' && (
              <div>
                {activitiesQ.isLoading ? (
                  <div className="text-sm text-ink-500">Carregando atividades…</div>
                ) : !activitiesQ.data?.items?.length ? (
                  <EmptyState
                    icon={ActivityIcon}
                    title="Nenhuma atividade ainda"
                    subtitle="Crie ligações, reuniões e tarefas relacionadas a este deal."
                  />
                ) : (
                  <ul className="space-y-2">
                    {activitiesQ.data.items.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-center gap-3 rounded-lg border border-ink-200 p-3"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                          <Calendar className="h-4 w-4" />
                        </span>
                        <div className="flex-1">
                          <div
                            className={cn(
                              'text-sm font-semibold text-ink-900',
                              a.done && 'text-ink-400 line-through',
                            )}
                          >
                            {a.subject}
                          </div>
                          <div className="text-xs text-ink-500">
                            {a.dueAt
                              ? new Date(a.dueAt).toLocaleString('pt-BR')
                              : 'sem prazo'}{' '}
                            · {a.type}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {tab === 'notes' && (
              <EmptyState
                icon={StickyNote}
                title="Notas em breve"
                subtitle="Você poderá registrar observações livres e anexar a este deal."
              />
            )}
            {tab === 'email' && (
              <EmptyState
                icon={Mail}
                title="E-mails sincronizados em breve"
                subtitle="Conecte o Gmail/Outlook para vincular conversas a este deal."
              />
            )}
            {tab === 'files' && (
              <EmptyState
                icon={Paperclip}
                title="Anexos em breve"
                subtitle="PDF, propostas e contratos do deal ficarão aqui (upload via MinIO)."
              />
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}

function Field({ label, children }: { label: string; children: any }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wide text-ink-500">{label}</div>
      <div className="mt-0.5 truncate text-sm text-ink-800">{children}</div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid place-items-center py-10 text-center">
      <Icon className="h-8 w-8 text-ink-300" />
      <p className="mt-2 text-sm font-semibold text-ink-900">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-ink-500">{subtitle}</p>
    </div>
  );
}
