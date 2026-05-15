import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { webhooksApi, type WebhookDelivery } from '@/api/webhooks.api';

interface Props {
  webhookId: string | null;
  open: boolean;
  onClose: () => void;
}

export function DeliveriesDrawer({ webhookId, open, onClose }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['webhook-deliveries', webhookId, page],
    queryFn: () => webhooksApi.deliveries(webhookId!, page, 25),
    enabled: open && !!webhookId,
  });

  return (
    <Drawer open={open} onClose={onClose} width="lg" title="Histórico de entregas">
      <div className="p-5">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {data?.items.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma entrega registrada ainda.</p>
        )}
        <div className="space-y-2">
          {data?.items.map((d) => (
            <DeliveryRow
              key={d.id}
              delivery={d}
              expanded={expanded === d.id}
              onToggle={() => setExpanded(expanded === d.id ? null : d.id)}
            />
          ))}
        </div>
        {data && data.pages > 1 && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Página {data.page} de {data.pages}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-7 rounded-md border border-border bg-card px-3 text-xs disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 rounded-md border border-border bg-card px-3 text-xs disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

function DeliveryRow({
  delivery,
  expanded,
  onToggle,
}: {
  delivery: WebhookDelivery;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-md border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 p-2 text-left hover:bg-muted/40"
      >
        <ChevronRight
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            expanded ? 'rotate-90' : ''
          }`}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <code className="text-xs font-semibold text-foreground">{delivery.event}</code>
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                delivery.success ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
              }`}
            >
              {delivery.statusCode ?? 'ERR'}
            </span>
            {delivery.latencyMs !== null && (
              <span className="text-[11px] text-muted-foreground">{delivery.latencyMs}ms</span>
            )}
            <span className="text-[11px] text-muted-foreground">tentativa {delivery.attempt}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {new Date(delivery.createdAt).toLocaleString('pt-BR')}
          </span>
        </div>
      </button>
      {expanded && (
        <div className="space-y-2 border-t border-border p-3">
          <div>
            <span className="field-label">Payload enviado</span>
            <pre className="max-h-32 overflow-auto rounded-md bg-foreground/10 dark:bg-foreground/5 p-2 text-[11px] text-foreground">
              {JSON.stringify(delivery.payload, null, 2)}
            </pre>
          </div>
          <div>
            <span className="field-label">Response body</span>
            <pre className="max-h-32 overflow-auto rounded-md bg-muted/40 p-2 text-[11px] text-foreground/80">
              {delivery.responseBody ?? '(vazio)'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
