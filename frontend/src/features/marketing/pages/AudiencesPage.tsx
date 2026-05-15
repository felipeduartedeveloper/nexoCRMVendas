import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Users2, X } from 'lucide-react';
import {
  marketingApi,
  type Audience,
  type AudienceFilter,
} from '@/api/marketing.api';

const FIELD_OPTIONS = [
  { value: 'label', label: 'Tag/Label' },
  { value: 'email', label: 'Email' },
  { value: 'createdAt', label: 'Data de criação' },
  { value: 'orgCompanyId', label: 'Empresa' },
];

const OPERATOR_OPTIONS = [
  { value: 'eq', label: 'igual a' },
  { value: 'neq', label: 'diferente de' },
  { value: 'in', label: 'em (lista)' },
  { value: 'contains', label: 'contém' },
  { value: 'gt', label: 'maior que' },
  { value: 'lt', label: 'menor que' },
];

export function AudiencesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data = [] } = useQuery({
    queryKey: ['marketing', 'audiences'],
    queryFn: marketingApi.listAudiences,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => marketingApi.deleteAudience(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'audiences'] }),
  });

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-ink-200 px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Audiências</h1>
          <p className="text-sm text-ink-500">
            Segmente seus contatos com filtros pra atingir os destinatários certos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Nova audiência
        </button>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {data.length === 0 ? (
          <div className="grid place-items-center p-16 text-center">
            <Users2 className="h-12 w-12 text-ink-300" />
            <h2 className="mt-3 text-base font-semibold text-ink-900">
              Crie sua primeira audiência
            </h2>
            <p className="mt-1 max-w-sm text-sm text-ink-500">
              Audiências são grupos dinâmicos baseados em filtros sobre seus contatos.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-md border border-ink-200 bg-white p-3"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink-900">{a.name}</h3>
                  {a.description && (
                    <p className="text-xs text-ink-500">{a.description}</p>
                  )}
                  <p className="mt-1 text-xs text-ink-600">
                    {a.estimatedSize} contato{a.estimatedSize !== 1 ? 's' : ''} ·{' '}
                    {a.filters.length} filtro{a.filters.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Apagar audiência?')) deleteMut.mutate(a.id);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-md text-ink-500 hover:bg-ink-100 hover:text-danger"
                  aria-label="Apagar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && <AudienceBuilderModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function AudienceBuilderModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [filters, setFilters] = useState<AudienceFilter[]>([
    { field: 'label', operator: 'in', value: ['hot'] },
  ]);
  const [preview, setPreview] = useState<{
    estimatedSize: number;
    sample: Array<{ id: string; name: string; email: string | null }>;
  } | null>(null);

  const previewMut = useMutation({
    mutationFn: () => marketingApi.previewAudience(filters),
    onSuccess: (data) => setPreview(data),
  });

  const createMut = useMutation({
    mutationFn: () =>
      marketingApi.createAudience({
        name: name.trim(),
        description: description.trim() || undefined,
        filters,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marketing', 'audiences'] });
      onClose();
    },
  });

  function updateFilter(i: number, patch: Partial<AudienceFilter>) {
    setFilters(filters.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-elevated">
        <header className="flex items-center justify-between border-b border-ink-200 p-5">
          <h2 className="text-lg font-bold text-ink-900">Nova audiência</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="space-y-3 p-5">
          <label className="block">
            <span className="field-label">Nome *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 w-full rounded-md border border-ink-200 px-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="field-label">Descrição</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-9 w-full rounded-md border border-ink-200 px-2 text-sm"
            />
          </label>

          <div>
            <p className="field-label">Filtros (combinados com AND)</p>
            <div className="space-y-2">
              {filters.map((f, i) => (
                <div key={i} className="grid grid-cols-12 gap-2">
                  <select
                    value={f.field}
                    onChange={(e) => updateFilter(i, { field: e.target.value })}
                    className="col-span-4 h-9 rounded-md border border-ink-200 bg-white px-2 text-sm"
                  >
                    {FIELD_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={f.operator}
                    onChange={(e) => updateFilter(i, { operator: e.target.value })}
                    className="col-span-3 h-9 rounded-md border border-ink-200 bg-white px-2 text-sm"
                  >
                    {OPERATOR_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <input
                    value={String(f.value ?? '')}
                    onChange={(e) =>
                      updateFilter(i, {
                        value:
                          f.operator === 'in'
                            ? e.target.value.split(',').map((s) => s.trim())
                            : e.target.value,
                      })
                    }
                    className="col-span-4 h-9 rounded-md border border-ink-200 px-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setFilters(filters.filter((_, idx) => idx !== i))}
                    className="col-span-1 grid h-9 place-items-center rounded-md text-ink-500 hover:bg-ink-100 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setFilters([...filters, { field: 'label', operator: 'eq', value: '' }])
                }
                className="text-xs font-semibold text-brand-700 hover:underline"
              >
                + Adicionar filtro
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => previewMut.mutate()}
              disabled={previewMut.isPending}
              className="h-9 rounded-md border border-ink-200 bg-white px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              {previewMut.isPending ? 'Calculando...' : 'Pré-visualizar'}
            </button>
            {preview && (
              <span className="text-sm font-semibold text-brand-700">
                {preview.estimatedSize} contato(s) corresponde(m)
              </span>
            )}
          </div>

          {preview && preview.sample.length > 0 && (
            <div className="rounded-md border border-ink-200 bg-ink-50 p-2">
              <p className="text-xs font-semibold text-ink-600">Amostra:</p>
              <ul className="mt-1 text-xs text-ink-700">
                {preview.sample.map((s) => (
                  <li key={s.id}>
                    {s.name} {s.email && <span className="text-ink-500">· {s.email}</span>}
                  </li>
                ))}
              </ul>
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
            type="button"
            onClick={() => createMut.mutate()}
            disabled={createMut.isPending || !name.trim()}
            className="h-9 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {createMut.isPending ? 'Salvando...' : 'Criar audiência'}
          </button>
        </footer>
      </div>
    </div>
  );
}
