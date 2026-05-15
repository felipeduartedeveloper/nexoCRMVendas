import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Search } from 'lucide-react';
import {
  productsApi,
  type Product,
  BILLING_FREQUENCY_LABELS,
  formatCurrency,
} from '@/api/products.api';
import { NewProductModal } from '../components/NewProductModal';
import { ProductDetailDrawer } from '../components/ProductDetailDrawer';

type ActiveFilter = 'all' | 'true' | 'false';

export function ProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<ActiveFilter>('all');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [openNew, setOpenNew] = useState(false);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit: 25,
      search: search || undefined,
      active: active === 'all' ? undefined : active,
      category: category || undefined,
    }),
    [page, search, active, category],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.list(params),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      productsApi.setActive(id, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });

  const items = data?.items ?? [];

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-ink-200 px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Produtos</h1>
          <p className="text-sm text-ink-500">
            Catálogo de produtos vendáveis. Vincule aos negócios para calcular valores.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpenNew(true)}
          className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Novo produto
        </button>
      </header>

      <div className="flex items-center gap-3 border-b border-ink-200 px-6 py-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome ou código..."
            className="h-9 w-full rounded-md border border-ink-200 bg-white pl-8 pr-3 text-sm"
          />
        </div>
        <input
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          placeholder="Categoria"
          className="h-9 w-40 rounded-md border border-ink-200 bg-white px-2 text-sm"
        />
        <select
          value={active}
          onChange={(e) => {
            setActive(e.target.value as ActiveFilter);
            setPage(1);
          }}
          className="h-9 rounded-md border border-ink-200 bg-white px-2 text-sm"
        >
          <option value="all">Todos</option>
          <option value="true">Apenas ativos</option>
          <option value="false">Apenas inativos</option>
        </select>
        <div className="ml-auto text-xs text-ink-500">
          {data ? `${data.total} produto(s)` : '...'}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading && (
          <div className="p-8 text-sm text-ink-500">Carregando produtos...</div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="grid place-items-center p-16 text-center">
            <Package className="h-12 w-12 text-ink-300" />
            <h2 className="mt-3 text-base font-semibold text-ink-900">
              Cadastre seu primeiro produto
            </h2>
            <p className="mt-1 max-w-sm text-sm text-ink-500">
              Produtos podem ser vinculados a negócios com quantidade, desconto e
              imposto para calcular o valor total.
            </p>
            <button
              type="button"
              onClick={() => setOpenNew(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              Novo produto
            </button>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <table className="min-w-full divide-y divide-ink-200 text-sm">
            <thead className="sticky top-0 z-10 bg-ink-50 text-xs font-semibold uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-3 py-2 text-left">Ativo</th>
                <th className="px-3 py-2 text-left">Nome</th>
                <th className="px-3 py-2 text-left">Código</th>
                <th className="px-3 py-2 text-left">Categoria</th>
                <th className="px-3 py-2 text-left">Unidade</th>
                <th className="px-3 py-2 text-left">Preços</th>
                <th className="px-3 py-2 text-left">Frequência</th>
                <th className="px-3 py-2 text-left">Imposto</th>
                <th className="px-3 py-2 text-left">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200 bg-white">
              {items.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  onOpen={() => setDrawerId(p.id)}
                  onToggle={(v) => toggleMut.mutate({ id: p.id, value: v })}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between border-t border-ink-200 px-6 py-2">
          <span className="text-xs text-ink-500">
            Página {data.page} de {data.pages}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 rounded-md border border-ink-200 bg-white px-3 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 rounded-md border border-ink-200 bg-white px-3 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      <NewProductModal open={openNew} onClose={() => setOpenNew(false)} />
      <ProductDetailDrawer
        productId={drawerId}
        open={drawerId !== null}
        onClose={() => setDrawerId(null)}
      />
    </div>
  );
}

function ProductRow({
  product,
  onOpen,
  onToggle,
}: {
  product: Product;
  onOpen: () => void;
  onToggle: (v: boolean) => void;
}) {
  const firstPrice = product.prices?.[0];
  const otherCount = (product.prices?.length ?? 1) - 1;

  return (
    <tr className="cursor-pointer transition-colors hover:bg-ink-50" onClick={onOpen}>
      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
        <label className="inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={product.active}
            onChange={(e) => onToggle(e.target.checked)}
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
          />
        </label>
      </td>
      <td className="px-3 py-2.5 font-medium text-ink-900">{product.name}</td>
      <td className="px-3 py-2.5 text-ink-700">{product.code ?? '—'}</td>
      <td className="px-3 py-2.5 text-ink-700">{product.category ?? '—'}</td>
      <td className="px-3 py-2.5 text-ink-700">{product.unit ?? '—'}</td>
      <td className="px-3 py-2.5 text-ink-700">
        {firstPrice ? (
          <span>
            {formatCurrency(firstPrice.price, firstPrice.currency)}
            {otherCount > 0 && (
              <span className="ml-1 text-xs text-ink-500">
                + {otherCount} moeda{otherCount > 1 ? 's' : ''}
              </span>
            )}
          </span>
        ) : (
          <span className="text-ink-400">—</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-ink-700">
        {BILLING_FREQUENCY_LABELS[product.billingFrequency]}
        {product.billingCycles ? ` · ${product.billingCycles}x` : ''}
      </td>
      <td className="px-3 py-2.5 text-ink-700">{Number(product.tax).toFixed(2)}%</td>
      <td className="px-3 py-2.5 text-ink-500">
        {new Date(product.createdAt).toLocaleDateString('pt-BR')}
      </td>
    </tr>
  );
}
