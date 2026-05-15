import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pause, Play, Plus, RefreshCw, Send, Trash2, Webhook as WebhookIcon } from 'lucide-react';
import { webhooksApi, type Webhook, type WebhookStatus } from '@/api/webhooks.api';
import { WebhookFormModal } from '../components/webhooks/WebhookFormModal';
import { DeliveriesDrawer } from '../components/webhooks/DeliveriesDrawer';

const STATUS_LABELS: Record<WebhookStatus, string> = {
  ACTIVE: 'Ativo',
  PAUSED: 'Pausado',
  FAILING: 'Falhando',
};
const STATUS_COLORS: Record<WebhookStatus, string> = {
  ACTIVE: 'bg-success/10 text-success',
  PAUSED: 'bg-muted text-muted-foreground',
  FAILING: 'bg-danger/10 text-danger',
};

export function WebhooksPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Webhook | null>(null);
  const [deliveriesOf, setDeliveriesOf] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: webhooksApi.list,
  });

  const setStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'PAUSED' }) =>
      webhooksApi.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
  });

  const testMut = useMutation({
    mutationFn: (id: string) => webhooksApi.test(id),
    onSuccess: (res) => {
      alert(`Teste enviado. Status: ${res.statusCode ?? 'erro'} · ${res.latencyMs ?? '?'}ms`);
      qc.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => webhooksApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
  });

  const regenerateMut = useMutation({
    mutationFn: (id: string) => webhooksApi.regenerateSecret(id),
    onSuccess: (data) => {
      alert(`Novo secret: ${data.secret}\n\n⚠️ Guarde agora, não mostraremos novamente.`);
      qc.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Webhooks</h1>
          <p className="text-sm text-muted-foreground">
            Receba notificações HTTP em tempo real quando dados mudam no oxlify.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Novo webhook
        </button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {!isLoading && data.length === 0 && (
        <div className="grid place-items-center rounded-lg border border-dashed border-border p-12 text-center">
          <WebhookIcon className="h-10 w-10 text-muted-foreground/50" />
          <h2 className="mt-3 text-base font-semibold text-foreground">
            Sem webhooks configurados
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Configure URLs externas pra receber eventos quando deals, pessoas, atividades ou
            leads mudarem. Cada payload é assinado com HMAC SHA-256.
          </p>
        </div>
      )}

      {data.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Nome / URL</th>
                <th className="px-3 py-2 text-left">Eventos</th>
                <th className="px-3 py-2 text-left">Última entrega</th>
                <th className="px-3 py-2 text-left">Código</th>
                <th className="px-3 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {data.map((w) => (
                <tr key={w.id} className="hover:bg-muted/40">
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[w.status]}`}
                    >
                      {STATUS_LABELS[w.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-foreground">{w.name ?? '(sem nome)'}</div>
                    <code className="block max-w-xs truncate text-[11px] text-muted-foreground">
                      {w.targetUrl}
                    </code>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className="inline-block cursor-help rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-foreground/80"
                      title={w.events.join('\n')}
                    >
                      {w.events.length} evento(s)
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-foreground/80">
                    {w.lastDeliveryAt
                      ? formatRelative(w.lastDeliveryAt)
                      : <span className="text-muted-foreground/70">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-foreground/80">
                    {w.lastStatusCode ?? <span className="text-muted-foreground/70">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => testMut.mutate(w.id)}
                        title="Testar"
                        className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveriesOf(w.id)}
                        title="Ver entregas"
                        className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(w);
                          setFormOpen(true);
                        }}
                        className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground/80 hover:bg-muted/40"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setStatusMut.mutate({
                            id: w.id,
                            status: w.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED',
                          })
                        }
                        title={w.status === 'PAUSED' ? 'Ativar' : 'Pausar'}
                        className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted"
                      >
                        {w.status === 'PAUSED' ? (
                          <Play className="h-3.5 w-3.5" />
                        ) : (
                          <Pause className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Gerar novo secret? Os clientes precisarão ser reconfigurados.'))
                            regenerateMut.mutate(w.id);
                        }}
                        title="Regenerar secret"
                        className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Apagar webhook?')) deleteMut.mutate(w.id);
                        }}
                        title="Apagar"
                        className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <WebhookFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        editing={editing}
      />

      <DeliveriesDrawer
        webhookId={deliveriesOf}
        open={deliveriesOf !== null}
        onClose={() => setDeliveriesOf(null)}
      />
    </div>
  );
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return 'agora há pouco';
  if (diff < 3_600_000) return `há ${Math.floor(diff / 60_000)}min`;
  if (diff < 86_400_000) return `há ${Math.floor(diff / 3_600_000)}h`;
  return d.toLocaleDateString('pt-BR');
}
