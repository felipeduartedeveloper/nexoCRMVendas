import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Plus, Trash2 } from 'lucide-react';
const SUPPORTED_CURRENCIES = ['BRL', 'USD', 'EUR', 'GBP', 'ARS', 'MXN', 'CLP', 'COP'];
export function PriceList({ prices, onChange, readOnly = false }) {
    function update(index, patch) {
        onChange(prices.map((p, i) => (i === index ? { ...p, ...patch } : p)));
    }
    function add() {
        const remaining = SUPPORTED_CURRENCIES.find((c) => !prices.some((p) => p.currency.toUpperCase() === c));
        onChange([...prices, { currency: remaining ?? 'USD', price: 0 }]);
    }
    function remove(index) {
        onChange(prices.filter((_, i) => i !== index));
    }
    return (_jsxs("div", { className: "space-y-2", children: [prices.length === 0 && (_jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum pre\u00E7o cadastrado." })), prices.map((p, i) => (_jsxs("div", { className: "grid grid-cols-12 gap-2 items-center", children: [_jsx("select", { disabled: readOnly, value: p.currency, onChange: (e) => update(i, { currency: e.target.value }), className: "col-span-3 h-9 rounded-md border border-border bg-card px-2 text-sm", children: SUPPORTED_CURRENCIES.map((c) => (_jsx("option", { value: c, children: c }, c))) }), _jsx("input", { disabled: readOnly, type: "number", step: "0.01", min: "0", placeholder: "Pre\u00E7o", value: p.price, onChange: (e) => update(i, { price: Number(e.target.value) }), className: "col-span-4 h-9 rounded-md border border-border bg-card px-2 text-sm" }), _jsx("input", { disabled: readOnly, type: "number", step: "0.01", min: "0", placeholder: "Custo (opcional)", value: p.costPrice ?? '', onChange: (e) => update(i, {
                            costPrice: e.target.value === '' ? undefined : Number(e.target.value),
                        }), className: "col-span-4 h-9 rounded-md border border-border bg-card px-2 text-sm" }), !readOnly && (_jsx("button", { type: "button", onClick: () => remove(i), "aria-label": "Remover pre\u00E7o", className: "col-span-1 grid h-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger", children: _jsx(Trash2, { className: "h-4 w-4" }) }))] }, i))), !readOnly && (_jsxs("button", { type: "button", onClick: add, className: "inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:bg-muted/40", children: [_jsx(Plus, { className: "h-3.5 w-3.5" }), "Adicionar moeda"] }))] }));
}
