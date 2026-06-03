import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { productsApi, BILLING_FREQUENCY_LABELS, VISIBILITY_LABELS, } from '@/api/products.api';
import { extractErrorMessage } from '@/lib/api';
import { PriceList } from './PriceList';
export function NewProductModal({ open, onClose }) {
    const qc = useQueryClient();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [category, setCategory] = useState('');
    const [unit, setUnit] = useState('un');
    const [description, setDescription] = useState('');
    const [prices, setPrices] = useState([{ currency: 'BRL', price: 0 }]);
    const [billingFrequency, setBillingFrequency] = useState('ONE_TIME');
    const [billingCycles, setBillingCycles] = useState('');
    const [tax, setTax] = useState(0);
    const [visibleTo, setVisibleTo] = useState('ENTIRE_COMPANY');
    const [error, setError] = useState(null);
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
        mutationFn: () => productsApi.create({
            name: name.trim(),
            code: code.trim() || undefined,
            category: category.trim() || undefined,
            unit: unit.trim() || undefined,
            description: description.trim() || undefined,
            prices: prices.filter((p) => p.price > 0),
            billingFrequency,
            billingCycles: billingFrequency !== 'ONE_TIME' && billingCycles !== ''
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
    function onSubmit(e) {
        e.preventDefault();
        if (name.trim().length < 2) {
            setError('Informe um nome com pelo menos 2 caracteres.');
            return;
        }
        setError(null);
        mut.mutate();
    }
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4", children: _jsxs("form", { onSubmit: onSubmit, className: "w-full max-w-2xl rounded-xl bg-card shadow-elevated", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-border p-5", children: [_jsx("h2", { className: "text-lg font-bold text-foreground", children: "Novo produto" }), _jsx("button", { type: "button", onClick: onClose, "aria-label": "Fechar", className: "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted", children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "max-h-[70vh] space-y-5 overflow-y-auto p-5", children: [_jsxs("section", { className: "space-y-3", children: [_jsx("h3", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", children: "B\u00E1sico" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Nome *" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), required: true, minLength: 2, maxLength: 255, className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "C\u00F3digo / SKU" }), _jsx("input", { value: code, onChange: (e) => setCode(e.target.value), maxLength: 100, className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Categoria" }), _jsx("input", { value: category, onChange: (e) => setCategory(e.target.value), maxLength: 100, className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Unidade" }), _jsx("input", { value: unit, onChange: (e) => setUnit(e.target.value), maxLength: 50, placeholder: "un, kg, hora...", className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Descri\u00E7\u00E3o" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), rows: 2, className: "w-full rounded-md border border-border px-2 py-1.5 text-sm" })] })] }), _jsxs("section", { className: "space-y-3", children: [_jsx("h3", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", children: "Pre\u00E7os" }), _jsx(PriceList, { prices: prices, onChange: setPrices })] }), _jsxs("section", { className: "space-y-3", children: [_jsx("h3", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", children: "Cobran\u00E7a" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Frequ\u00EAncia" }), _jsx("select", { value: billingFrequency, onChange: (e) => setBillingFrequency(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm", children: Object.entries(BILLING_FREQUENCY_LABELS).map(([k, v]) => (_jsx("option", { value: k, children: v }, k))) })] }), billingFrequency !== 'ONE_TIME' && (_jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Ciclos" }), _jsx("input", { type: "number", min: 1, value: billingCycles, onChange: (e) => setBillingCycles(e.target.value === '' ? '' : Number(e.target.value)), placeholder: "Indeterminado", className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }))] })] }), _jsxs("section", { className: "space-y-3", children: [_jsx("h3", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", children: "Outros" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Imposto (%)" }), _jsx("input", { type: "number", step: "0.01", min: "0", value: tax, onChange: (e) => setTax(e.target.value === '' ? '' : Number(e.target.value)), className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Visibilidade" }), _jsx("select", { value: visibleTo, onChange: (e) => setVisibleTo(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm", children: Object.entries(VISIBILITY_LABELS).map(([k, v]) => (_jsx("option", { value: k, children: v }, k))) })] })] })] }), error && (_jsx("div", { className: "rounded-md border border-danger/30 bg-danger/5 p-2 text-sm text-danger", children: error }))] }), _jsxs("footer", { className: "flex items-center justify-end gap-2 border-t border-border p-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "h-9 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground/80 hover:bg-muted/40", children: "Cancelar" }), _jsx("button", { type: "submit", disabled: mut.isPending, className: "h-9 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50", children: mut.isPending ? 'Salvando...' : 'Criar produto' })] })] }) }));
}
