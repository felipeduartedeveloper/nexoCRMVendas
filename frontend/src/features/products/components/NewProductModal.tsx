import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import {
  productsApi,
  type BillingFrequency,
  type CreatePriceInput,
  type ProductVisibility,
  BILLING_FREQUENCY_LABELS,
  VISIBILITY_LABELS,
} from '@/api/products.api';
import { extractErrorMessage } from '@/lib/api';
import { PriceList } from './PriceList';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NewProductModal({ open, onClose }: Props) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('un');
  const [description, setDescription] = useState('');
  const [prices, setPrices] = useState<CreatePriceInput[]>([{ currency: 'BRL', price: 0 }]);
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('ONE_TIME');
  const [billingCycles, setBillingCycles] = useState<number | ''>('');
  const [tax, setTax] = useState<number | ''>(0);
  const [visibleTo, setVisibleTo] = useState<ProductVisibility>('ENTIRE_COMPANY');
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName('');
    setCode('');
    setCategory('');
    setUnit('un');
    setDescription('');
    setPrices([{ currency: 'BRL', price: 0 }]);
    setBillingFrequency('ONE_TIME');
    setBillingCycles('');
    setTax(0);
    setVisibleTo('ENTIRE_COMPANY');
    setError(null);
  }

  const mut = useMutation({
    mutationFn: () =>
      productsApi.create({
        name: name.trim(),
        code: code.trim() || undefined,
        category: category.trim() || undefined,
        unit: unit.trim() || undefined,
        description: description.trim() || undefined,
        prices: prices.filter((p) => p.price > 0),
        billingFrequency,
        billingCycles:
          billingFrequency !== 'ONE_TIME' && billingCycles !== ''
            ? Number(billingCycles)
            : undefined,
        tax: tax === '' ? 0 : Number(tax),
        visibleTo,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      reset();
      onClose();
    },
    onError: (err) => setError(extractErrorMessage(err, 'Erro ao criar produto')),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Informe um nome com pelo menos 2 caracteres.');
      return;
    }
    setError(null);
    mut.mutate();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl rounded-xl bg-card shadow-elevated"
      >
        <header className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-bold text-foreground">Novo produto</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Básico
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="field-label">Nome *</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={255}
                  className="h-9 w-full rounded-md border border-border px-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="field-label">Código / SKU</span>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={100}
                  className="h-9 w-full rounded-md border border-border px-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="field-label">Categoria</span>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  maxLength={100}
                  className="h-9 w-full rounded-md border border-border px-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="field-label">Unidade</span>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  maxLength={50}
                  placeholder="un, kg, hora..."
                  className="h-9 w-full rounded-md border border-border px-2 text-sm"
                />
              </label>
            </div>
            <label className="block">
              <span className="field-label">Descrição</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
              />
            </label>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Preços
            </h3>
            <PriceList prices={prices} onChange={setPrices} />
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Cobrança
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="field-label">Frequência</span>
                <select
                  value={billingFrequency}
                  onChange={(e) => setBillingFrequency(e.target.value as BillingFrequency)}
                  className="h-9 w-full rounded-md border border-border px-2 text-sm"
                >
                  {Object.entries(BILLING_FREQUENCY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              {billingFrequency !== 'ONE_TIME' && (
                <label className="block">
                  <span className="field-label">Ciclos</span>
                  <input
                    type="number"
                    min={1}
                    value={billingCycles}
                    onChange={(e) =>
                      setBillingCycles(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="Indeterminado"
                    className="h-9 w-full rounded-md border border-border px-2 text-sm"
                  />
                </label>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Outros
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="field-label">Imposto (%)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tax}
                  onChange={(e) => setTax(e.target.value === '' ? '' : Number(e.target.value))}
                  className="h-9 w-full rounded-md border border-border px-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="field-label">Visibilidade</span>
                <select
                  value={visibleTo}
                  onChange={(e) => setVisibleTo(e.target.value as ProductVisibility)}
                  className="h-9 w-full rounded-md border border-border px-2 text-sm"
                >
                  {Object.entries(VISIBILITY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {error && (
            <div className="rounded-md border border-danger/30 bg-danger/5 p-2 text-sm text-danger">
              {error}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground/80 hover:bg-muted/40"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mut.isPending}
            className="h-9 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {mut.isPending ? 'Salvando...' : 'Criar produto'}
          </button>
        </footer>
      </form>
    </div>
  );
}
