import { Plus, Trash2 } from 'lucide-react';
import type { CreatePriceInput } from '@/api/products.api';

interface Props {
  prices: CreatePriceInput[];
  onChange: (prices: CreatePriceInput[]) => void;
  readOnly?: boolean;
}

const SUPPORTED_CURRENCIES = ['BRL', 'USD', 'EUR', 'GBP', 'ARS', 'MXN', 'CLP', 'COP'];

export function PriceList({ prices, onChange, readOnly = false }: Props) {
  function update(index: number, patch: Partial<CreatePriceInput>) {
    onChange(prices.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }
  function add() {
    const remaining = SUPPORTED_CURRENCIES.find(
      (c) => !prices.some((p) => p.currency.toUpperCase() === c),
    );
    onChange([...prices, { currency: remaining ?? 'USD', price: 0 }]);
  }
  function remove(index: number) {
    onChange(prices.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {prices.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum preço cadastrado.</p>
      )}
      {prices.map((p, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          <select
            disabled={readOnly}
            value={p.currency}
            onChange={(e) => update(i, { currency: e.target.value })}
            className="col-span-3 h-9 rounded-md border border-border bg-card px-2 text-sm"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            disabled={readOnly}
            type="number"
            step="0.01"
            min="0"
            placeholder="Preço"
            value={p.price}
            onChange={(e) => update(i, { price: Number(e.target.value) })}
            className="col-span-4 h-9 rounded-md border border-border bg-card px-2 text-sm"
          />
          <input
            disabled={readOnly}
            type="number"
            step="0.01"
            min="0"
            placeholder="Custo (opcional)"
            value={p.costPrice ?? ''}
            onChange={(e) =>
              update(i, {
                costPrice: e.target.value === '' ? undefined : Number(e.target.value),
              })
            }
            className="col-span-4 h-9 rounded-md border border-border bg-card px-2 text-sm"
          />
          {!readOnly && (
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remover preço"
              className="col-span-1 grid h-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:bg-muted/40"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar moeda
        </button>
      )}
    </div>
  );
}
