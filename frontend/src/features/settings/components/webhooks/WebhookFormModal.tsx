import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, X } from 'lucide-react';
import {
  ENTITY_LABELS,
  groupEvents,
  webhooksApi,
  type Webhook,
} from '@/api/webhooks.api';
import { extractErrorMessage } from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  editing: Webhook | null;
}

export function WebhookFormModal({ open, onClose, editing }: Props) {
  const qc = useQueryClient();
  const isNew = !editing;
  const [name, setName] = useState(editing?.name ?? '');
  const [targetUrl, setTargetUrl] = useState(editing?.targetUrl ?? '');
  const [events, setEvents] = useState<string[]>(editing?.events ?? []);
  const [error, setError] = useState<string | null>(null);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const { data: allEvents = [] } = useQuery({
    queryKey: ['webhooks', 'events'],
    queryFn: webhooksApi.events,
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '');
      setTargetUrl(editing?.targetUrl ?? '');
      setEvents(editing?.events ?? []);
      setError(null);
      setCreatedSecret(null);
    }
  }, [open, editing?.id]);

  const grouped = groupEvents(allEvents);

  const createMut = useMutation({
    mutationFn: () =>
      webhooksApi.create({
        targetUrl: targetUrl.trim(),
        events,
        name: name.trim() || undefined,
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['webhooks'] });
      setCreatedSecret(data.secret);
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const updateMut = useMutation({
    mutationFn: () =>
      webhooksApi.update(editing!.id, {
        name: name.trim() || null,
        targetUrl: targetUrl.trim(),
        events,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['webhooks'] });
      onClose();
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  function toggleEvent(ev: string) {
    setEvents((curr) =>
      curr.includes(ev) ? curr.filter((e) => e !== ev) : [...curr, ev],
    );
  }

  function toggleEntity(entityEvents: string[]) {
    const allOn = entityEvents.every((e) => events.includes(e));
    if (allOn) setEvents(events.filter((e) => !entityEvents.includes(e)));
    else setEvents([...new Set([...events, ...entityEvents])]);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (events.length === 0) {
      setError('Selecione ao menos um evento.');
      return;
    }
    setError(null);
    if (isNew) createMut.mutate();
    else updateMut.mutate();
  }

  if (!open) return null;

  if (createdSecret) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
        <div className="w-full max-w-lg rounded-xl bg-white shadow-elevated">
          <header className="border-b border-ink-200 p-5">
            <h2 className="text-lg font-bold text-success">Webhook criado com sucesso</h2>
          </header>
          <div className="space-y-3 p-5">
            <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-sm text-ink-700">
              ⚠️ <strong>Copie o secret agora!</strong> Por segurança, ele não será mostrado novamente.
              Você pode regenerar depois, mas todos os webhooks já configurados pararão de validar.
            </div>
            <label className="block">
              <span className="field-label">Secret HMAC</span>
              <div className="flex gap-2">
                <code className="flex-1 break-all rounded-md border border-ink-200 bg-ink-50 px-2 py-1.5 font-mono text-xs">
                  {createdSecret}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(createdSecret)}
                  className="inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white px-2 text-xs font-medium text-ink-700 hover:bg-ink-50"
                >
                  <Copy className="h-3.5 w-3.5" /> Copiar
                </button>
              </div>
            </label>
            <p className="text-xs text-ink-500">
              Use esse valor pra verificar o header <code>X-Nexo-Signature</code> em cada
              webhook recebido: <code>sha256=HMAC(secret, body)</code>.
            </p>
          </div>
          <footer className="flex justify-end border-t border-ink-200 p-4">
            <button
              type="button"
              onClick={() => {
                setCreatedSecret(null);
                onClose();
              }}
              className="h-9 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Concluído
            </button>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-2xl rounded-xl bg-white shadow-elevated">
        <header className="flex items-center justify-between border-b border-ink-200 p-5">
          <h2 className="text-lg font-bold text-ink-900">
            {isNew ? 'Novo webhook' : 'Editar webhook'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-5">
          <label className="block">
            <span className="field-label">URL alvo *</span>
            <input
              required
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://api.exemplo.com.br/webhooks/oxlify"
              className="h-9 w-full rounded-md border border-ink-200 px-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="field-label">Nome (opcional)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Default: host da URL"
              className="h-9 w-full rounded-md border border-ink-200 px-2 text-sm"
            />
          </label>

          <div>
            <span className="field-label">Eventos assinados *</span>
            <div className="space-y-3">
              {Object.entries(grouped).map(([entity, evList]) => {
                const allOn = evList.every((e) => events.includes(e));
                return (
                  <div key={entity} className="rounded-md border border-ink-200 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-ink-900">
                        {ENTITY_LABELS[entity] ?? entity}
                      </h4>
                      <button
                        type="button"
                        onClick={() => toggleEntity(evList)}
                        className="text-xs font-semibold text-brand-700 hover:underline"
                      >
                        {allOn ? 'Desmarcar todos' : 'Marcar todos'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {evList.map((ev) => (
                        <label key={ev} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={events.includes(ev)}
                            onChange={() => toggleEvent(ev)}
                            className="h-3.5 w-3.5 rounded border-ink-300 text-brand-600"
                          />
                          <code className="text-ink-700">{ev}</code>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-danger/30 bg-danger/5 p-2 text-sm text-danger">
              {error}
            </div>
          )}
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-ink-200 p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-ink-200 bg-white px-4 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createMut.isPending || updateMut.isPending}
            className="h-9 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {createMut.isPending || updateMut.isPending ? 'Salvando...' : isNew ? 'Criar' : 'Salvar'}
          </button>
        </footer>
      </form>
    </div>
  );
}
