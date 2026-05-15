import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { customFieldsApi, type CustomField } from '@/api/settings.api';
import { extractErrorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';

const ENTITIES = ['CONTACT', 'COMPANY', 'DEAL', 'LEAD', 'ACTIVITY'] as const;

const DATA_TYPES = [
  'TEXT',
  'NUMBER',
  'DATE',
  'CHECKBOX',
  'SELECT',
  'MULTI_SELECT',
  'USER',
  'PHONE',
  'EMAIL',
  'URL',
  'MONETARY',
] as const;

export function DataFieldsPage() {
  const [entity, setEntity] = useState<(typeof ENTITIES)[number]>('DEAL');
  const [openNew, setOpenNew] = useState(false);

  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['custom-fields', entity],
    queryFn: () => customFieldsApi.list(entity),
  });

  const remove = useMutation({
    mutationFn: (id: string) => customFieldsApi.remove(id),
    onSuccess: async () => {
      toast.success('Campo removido.');
      await qc.invalidateQueries({ queryKey: ['custom-fields', entity] });
    },
  });

  const items = q.data ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Data fields</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Personalize campos extras em cada entidade.
          </p>
        </div>
        <Button onClick={() => setOpenNew(true)}>
          <Plus className="h-4 w-4" /> Novo campo
        </Button>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {ENTITIES.map((e) => (
          <button
            key={e}
            onClick={() => setEntity(e)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors',
              entity === e
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-border bg-card text-muted-foreground hover:border-border',
            )}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/40 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5">Label</th>
              <th className="px-4 py-2.5">Key</th>
              <th className="px-4 py-2.5">Tipo</th>
              <th className="px-4 py-2.5">Opções</th>
              <th className="px-4 py-2.5">Obrigatório</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {q.isLoading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-muted-foreground">Carregando…</td>
              </tr>
            ) : !items.length ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-sm text-muted-foreground">
                  <AlertCircle className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
                  Nenhum campo customizado em {entity}.
                </td>
              </tr>
            ) : (
              items.map((f) => (
                <tr key={f.id} className="border-b border-border/50 hover:bg-brand-50/30">
                  <td className="px-4 py-2.5 font-semibold text-foreground">{f.label}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{f.key}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-bold uppercase">
                      {f.dataType}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {f.options?.length ? f.options.join(', ') : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    {f.required ? (
                      <span className="text-xs font-bold text-warning">Obrigatório</span>
                    ) : (
                      <span className="text-xs text-muted-foreground/70">Opcional</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Remover este campo?')) remove.mutate(f.id);
                      }}
                      className="text-danger hover:text-red-700"
                      aria-label="Apagar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {openNew && (
        <NewFieldModal entity={entity} onClose={() => setOpenNew(false)} />
      )}
    </div>
  );
}

function NewFieldModal({ entity, onClose }: { entity: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [label, setLabel] = useState('');
  const [key, setKey] = useState('');
  const [dataType, setDataType] = useState<(typeof DATA_TYPES)[number]>('TEXT');
  const [options, setOptions] = useState('');
  const [required, setRequired] = useState(false);

  const m = useMutation({
    mutationFn: () =>
      customFieldsApi.create({
        entity,
        label,
        key,
        dataType,
        required,
        options:
          dataType === 'SELECT' || dataType === 'MULTI_SELECT'
            ? options.split(',').map((o) => o.trim()).filter(Boolean)
            : undefined,
      }),
    onSuccess: async () => {
      toast.success('Campo adicionado.');
      await qc.invalidateQueries({ queryKey: ['custom-fields', entity] });
      onClose();
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!label.trim() || !key.trim()) return toast.error('Label e key são obrigatórios.');
    m.mutate();
  }

  const needOptions = dataType === 'SELECT' || dataType === 'MULTI_SELECT';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-xl bg-card p-6 shadow-elevated">
        <h3 className="text-lg font-bold text-foreground">Novo campo em {entity}</h3>
        <Input
          label="Label"
          value={label}
          onChange={(e) => {
            const v = e.target.value;
            setLabel(v);
            setKey(
              v
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_+|_+$/g, ''),
            );
          }}
          required
        />
        <Input
          label="Key (slug, único por entidade)"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          required
        />
        <div>
          <span className="field-label">Tipo</span>
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value as any)}
            className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
          >
            {DATA_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        {needOptions && (
          <Input
            label="Opções (separadas por vírgula)"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            placeholder="Pequeno, Médio, Grande"
          />
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
          />
          Campo obrigatório
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={m.isPending}>
            Criar campo
          </Button>
        </div>
      </form>
    </div>
  );
}
