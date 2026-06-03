import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit3, Trash2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { productsApi, BILLING_FREQUENCY_LABELS, } from '@/api/products.api';
import { extractErrorMessage } from '@/lib/api';
import { PriceList } from './PriceList';
export function ProductDetailDrawer({ productId, open, onClose }) {
    const qc = useQueryClient();
    const [tab, setTab] = useState('overview');
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [category, setCategory] = useState('');
    const [unit, setUnit] = useState('');
    const [description, setDescription] = useState('');
    const [prices, setPrices] = useState([]);
    const [error, setError] = useState(null);
    const { data: product, isLoading } = useQuery({
        queryKey: ['products', productId],
        queryFn: () => productsApi.one(productId),
        enabled: !!productId && open,
    });
    useEffect(() => {
        if (product) {
            setName(product.name);
            setCode(product.code ?? '');
            setCategory(product.category ?? '');
            setUnit(product.unit ?? '');
            setDescription(product.description ?? '');
            setPrices(product.prices.map((p) => ({
                currency: p.currency,
                price: Number(p.price),
                costPrice: p.costPrice !== null ? Number(p.costPrice) : undefined,
            })));
            setEditing(false);
            setTab('overview');
        }
    }, [product?.id]);
    const updateMut = useMutation({
        mutationFn: () => productsApi.update(productId, {
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
        mutationFn: () => productsApi.setActive(productId, !product?.active),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    });
    const deleteMut = useMutation({
        mutationFn: () => productsApi.remove(productId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['products'] });
            onClose();
        },
        onError: (err) => setError(extractErrorMessage(err)),
    });
    function handleDelete() {
        if (!confirm('Apagar este produto? Esta ação não pode ser desfeita.'))
            return;
        deleteMut.mutate();
    }
    return (_jsxs(Drawer, { open: open, onClose: onClose, width: "lg", title: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "truncate", children: product?.name ?? 'Produto' }), product && (_jsx("span", { className: `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${product.active
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground'}`, children: product.active ? 'Ativo' : 'Inativo' }))] }), headerActions: product && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { type: "button", onClick: () => toggleActiveMut.mutate(), className: "rounded-md px-2 py-1 text-xs font-medium text-foreground/80 hover:bg-muted", children: product.active ? 'Desativar' : 'Ativar' }), _jsx("button", { type: "button", onClick: () => setEditing((v) => !v), "aria-label": "Editar", className: "grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted", children: _jsx(Edit3, { className: "h-4 w-4" }) }), _jsx("button", { type: "button", onClick: handleDelete, "aria-label": "Apagar", className: "grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })), children: [isLoading && _jsx("div", { className: "p-5 text-sm text-muted-foreground", children: "Carregando..." }), product && (_jsxs("div", { className: "flex h-full flex-col", children: [_jsx("nav", { className: "flex gap-1 border-b border-border px-5", children: [
                            ['overview', 'Visão geral'],
                            ['prices', 'Preços'],
                            ['deals', 'Negócios'],
                        ].map(([k, label]) => (_jsxs("button", { type: "button", onClick: () => setTab(k), className: `relative px-3 py-2.5 text-sm font-medium transition-colors ${tab === k ? 'text-brand-700' : 'text-muted-foreground hover:text-foreground'}`, children: [label, tab === k && (_jsx("span", { className: "absolute inset-x-0 -bottom-px h-0.5 bg-brand-600" }))] }, k))) }), _jsxs("div", { className: "flex-1 space-y-4 overflow-y-auto p-5", children: [tab === 'overview' && (_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Field, { label: "Nome", value: name, editing: editing, onChange: setName }), _jsx(Field, { label: "C\u00F3digo", value: code, editing: editing, onChange: setCode }), _jsx(Field, { label: "Categoria", value: category, editing: editing, onChange: setCategory }), _jsx(Field, { label: "Unidade", value: unit, editing: editing, onChange: setUnit }), _jsx("div", { className: "col-span-2", children: _jsx(Field, { label: "Descri\u00E7\u00E3o", value: description, editing: editing, onChange: setDescription, textarea: true }) }), _jsx(ReadOnly, { label: "Frequ\u00EAncia", value: BILLING_FREQUENCY_LABELS[product.billingFrequency] }), _jsx(ReadOnly, { label: "Imposto", value: `${Number(product.tax).toFixed(2)}%` }), _jsx(ReadOnly, { label: "Criado em", value: new Date(product.createdAt).toLocaleString('pt-BR') })] })), tab === 'prices' && (_jsx(PriceList, { prices: prices, onChange: setPrices, readOnly: !editing })), tab === 'deals' && _jsx(DealsTab, { productId: product.id }), editing && (_jsxs("div", { className: "flex justify-end gap-2 border-t border-border pt-4", children: [_jsx("button", { type: "button", onClick: () => setEditing(false), className: "h-9 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground/80 hover:bg-muted/40", children: "Cancelar" }), _jsx("button", { type: "button", onClick: () => updateMut.mutate(), disabled: updateMut.isPending, className: "h-9 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50", children: updateMut.isPending ? 'Salvando...' : 'Salvar alterações' })] })), error && (_jsx("div", { className: "rounded-md border border-danger/30 bg-danger/5 p-2 text-sm text-danger", children: error }))] })] }))] }));
}
function Field({ label, value, editing, onChange, textarea, }) {
    return (_jsxs("div", { children: [_jsx("span", { className: "field-label", children: label }), editing ? (textarea ? (_jsx("textarea", { value: value, onChange: (e) => onChange(e.target.value), rows: 3, className: "w-full rounded-md border border-border px-2 py-1.5 text-sm" })) : (_jsx("input", { value: value, onChange: (e) => onChange(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm" }))) : (_jsx("div", { className: "text-sm text-foreground", children: value || '—' }))] }));
}
function ReadOnly({ label, value }) {
    return (_jsxs("div", { children: [_jsx("span", { className: "field-label", children: label }), _jsx("div", { className: "text-sm text-foreground", children: value })] }));
}
function DealsTab({ productId }) {
    void productId;
    return (_jsxs("div", { className: "rounded-lg border border-dashed border-border p-6 text-center", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Neg\u00F3cios vinculados a este produto aparecer\u00E3o aqui quando voc\u00EA adicion\u00E1-lo a um deal." }), _jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: ["Use o endpoint ", _jsx("code", { children: "GET /deals/:dealId/products" }), " a partir da tela do deal."] })] }));
}
