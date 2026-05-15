import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit3, Trash2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import {
  productsApi,
  type CreatePriceInput,
  BILLING_FREQUENCY_LABELS,
  formatCurrency,
} from '@/api/products.api';
import { extractErrorMessage } from '@/lib/api';
import { PriceList } from './PriceList';

interface Props {
  productId: string | null;
  open: boolean;
  onClose: () => void;
}

type Tab = 'overview' | 'prices' | 'deals';

export function ProductDetailDrawer({ productId, open, onClose }: Props) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [prices, setPrices] = useState<CreatePriceInput[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['products', productId],
    queryFn: () => productsApi.one(productId!),
    enabled: !!productId && open,
  });

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCode(product.code ?? '');
      setCategory(product.category ?? '');
      setUnit(product.unit ?? '');
      setDescription(product.description ?? '');
      setPrices(
        product.prices.map((p) => ({
          currency: p.currency,
          price: Number(p.price),
          costPrice: p.costPrice !== null ? Number(p.costPrice) : undefined,
        })),
      );
      setEditing(false);
      setTab('overview');
    }
  }, [product?.id]);

  const updateMut = useMutation({
    mutationFn: () =>
      productsApi.update(productId!, {
        name: name.trim(),
        code: code.trim() || undefined,
        category: category.trim() || undefined,
        unit: unit.trim() || undefined,
        description: description.trim() || undefined,
        prices,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      setEditing(false);
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const toggleActiveMut = useMutation({
    mutationFn: () => productsApi.setActive(productId!, !product?.active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });

  const deleteMut = useMutation({
    mutationFn: () => productsApi.remove(productId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  function handleDelete() {
    if (!confirm('Apagar este produto? Esta ação não pode ser desfeita.')) return;
    deleteMut.mutate();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="lg"
      title={
        <div className="flex items-center gap-2">
          <span className="truncate">{product?.name ?? 'Produto'}</span>
          {product && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                product.active
                  ? 'bg-success/10 text-success'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {product.active ? 'Ativo' : 'Inativo'}
            </span>
          )}
        </div>
      }
      headerActions={
        product && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => toggleActiveMut.mutate()}
              className="rounded-md px-2 py-1 text-xs font-medium text-foreground/80 hover:bg-muted"
            >
              {product.active ? 'Desativar' : 'Ativar'}
            </button>
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              aria-label="Editar"
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              aria-label="Apagar"
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      }
    >
      {isLoading && <div className="p-5 text-sm text-muted-foreground">Carregando...</div>}
      {product && (
        <div className="flex h-full flex-col">
          <nav className="flex gap-1 border-b border-border px-5">
            {(
              [
                ['overview', 'Visão geral'],
                ['prices', 'Preços'],
                ['deals', 'Negócios'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`relative px-3 py-2.5 text-sm font-medium transition-colors ${
                  tab === k ? 'text-brand-700' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
                {tab === k && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600" />
                )}
              </button>
            ))}
          </nav>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {tab === 'overview' && (
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Nome"
                  value={name}
                  editing={editing}
                  onChange={setName}
                />
                <Field
                  label="Código"
                  value={code}
                  editing={editing}
                  onChange={setCode}
                />
                <Field
                  label="Categoria"
                  value={category}
                  editing={editing}
                  onChange={setCategory}
                />
                <Field
                  label="Unidade"
                  value={unit}
                  editing={editing}
                  onChange={setUnit}
                />
                <div className="col-span-2">
                  <Field
                    label="Descrição"
                    value={description}
                    editing={editing}
                    onChange={setDescription}
                    textarea
                  />
                </div>
                <ReadOnly
                  label="Frequência"
                  value={BILLING_FREQUENCY_LABELS[product.billingFrequency]}
                />
                <ReadOnly
                  label="Imposto"
                  value={`${Number(product.tax).toFixed(2)}%`}
                />
                <ReadOnly
                  label="Criado em"
                  value={new Date(product.createdAt).toLocaleString('pt-BR')}
                />
              </div>
            )}

            {tab === 'prices' && (
              <PriceList prices={prices} onChange={setPrices} readOnly={!editing} />
            )}

            {tab === 'deals' && <DealsTab productId={product.id} />}

            {editing && (
              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="h-9 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground/80 hover:bg-muted/40"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => updateMut.mutate()}
                  disabled={updateMut.isPending}
                  className="h-9 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {updateMut.isPending ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            )}

            {error && (
              <div className="rounded-md border border-danger/30 bg-danger/5 p-2 text-sm text-danger">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}

function Field({
  label,
  value,
  editing,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div>
      <span className="field-label">{label}</span>
      {editing ? (
        textarea ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-full rounded-md border border-border px-2 text-sm"
          />
        )
      ) : (
        <div className="text-sm text-foreground">{value || '—'}</div>
      )}
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

function DealsTab({ productId }: { productId: string }) {
  void productId;
  return (
    <div className="rounded-lg border border-dashed border-border p-6 text-center">
      <p className="text-sm text-muted-foreground">
        Negócios vinculados a este produto aparecerão aqui quando você adicioná-lo a um deal.
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Use o endpoint <code>GET /deals/:dealId/products</code> a partir da tela do deal.
      </p>
    </div>
  );
}
