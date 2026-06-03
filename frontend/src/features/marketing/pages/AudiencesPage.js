import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Users2, X } from 'lucide-react';
import { marketingApi, } from '@/api/marketing.api';
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
        mutationFn: (id) => marketingApi.deleteAudience(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'audiences'] }),
    });
    return (_jsxs("div", { className: "flex h-full flex-col", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-foreground", children: "Audi\u00EAncias" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Segmente seus contatos com filtros pra atingir os destinat\u00E1rios certos." })] }), _jsxs("button", { type: "button", onClick: () => setOpen(true), className: "inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700", children: [_jsx(Plus, { className: "h-4 w-4" }), " Nova audi\u00EAncia"] })] }), _jsx("div", { className: "flex-1 overflow-auto p-6", children: data.length === 0 ? (_jsxs("div", { className: "grid place-items-center p-16 text-center", children: [_jsx(Users2, { className: "h-12 w-12 text-muted-foreground/50" }), _jsx("h2", { className: "mt-3 text-base font-semibold text-foreground", children: "Crie sua primeira audi\u00EAncia" }), _jsx("p", { className: "mt-1 max-w-sm text-sm text-muted-foreground", children: "Audi\u00EAncias s\u00E3o grupos din\u00E2micos baseados em filtros sobre seus contatos." })] })) : (_jsx("div", { className: "space-y-2", children: data.map((a) => (_jsxs("div", { className: "flex items-center justify-between rounded-md border border-border bg-card p-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("h3", { className: "font-semibold text-foreground", children: a.name }), a.description && (_jsx("p", { className: "text-xs text-muted-foreground", children: a.description })), _jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [a.estimatedSize, " contato", a.estimatedSize !== 1 ? 's' : '', " \u00B7", ' ', a.filters.length, " filtro", a.filters.length !== 1 ? 's' : ''] })] }), _jsx("button", { type: "button", onClick: () => {
                                    if (confirm('Apagar audiência?'))
                                        deleteMut.mutate(a.id);
                                }, className: "grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger", "aria-label": "Apagar", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, a.id))) })) }), open && _jsx(AudienceBuilderModal, { onClose: () => setOpen(false) })] }));
}
function AudienceBuilderModal({ onClose }) {
    const qc = useQueryClient();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [filters, setFilters] = useState([
        { field: 'label', operator: 'in', value: ['hot'] },
    ]);
    const [preview, setPreview] = useState(null);
    const previewMut = useMutation({
        mutationFn: () => marketingApi.previewAudience(filters),
        onSuccess: (data) => setPreview(data),
    });
    const createMut = useMutation({
        mutationFn: () => marketingApi.createAudience({
            name: name.trim(),
            description: description.trim() || undefined,
            filters,
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['marketing', 'audiences'] });
            onClose();
        },
    });
    function updateFilter(i, patch) {
        setFilters(filters.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4", children: _jsxs("div", { className: "w-full max-w-2xl rounded-xl bg-card shadow-elevated", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-border p-5", children: [_jsx("h2", { className: "text-lg font-bold text-foreground", children: "Nova audi\u00EAncia" }), _jsx("button", { type: "button", onClick: onClose, "aria-label": "Fechar", className: "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted", children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "space-y-3 p-5", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Nome *" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Descri\u00E7\u00E3o" }), _jsx("input", { value: description, onChange: (e) => setDescription(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("div", { children: [_jsx("p", { className: "field-label", children: "Filtros (combinados com AND)" }), _jsxs("div", { className: "space-y-2", children: [filters.map((f, i) => (_jsxs("div", { className: "grid grid-cols-12 gap-2", children: [_jsx("select", { value: f.field, onChange: (e) => updateFilter(i, { field: e.target.value }), className: "col-span-4 h-9 rounded-md border border-border bg-card px-2 text-sm", children: FIELD_OPTIONS.map((o) => (_jsx("option", { value: o.value, children: o.label }, o.value))) }), _jsx("select", { value: f.operator, onChange: (e) => updateFilter(i, { operator: e.target.value }), className: "col-span-3 h-9 rounded-md border border-border bg-card px-2 text-sm", children: OPERATOR_OPTIONS.map((o) => (_jsx("option", { value: o.value, children: o.label }, o.value))) }), _jsx("input", { value: String(f.value ?? ''), onChange: (e) => updateFilter(i, {
                                                        value: f.operator === 'in'
                                                            ? e.target.value.split(',').map((s) => s.trim())
                                                            : e.target.value,
                                                    }), className: "col-span-4 h-9 rounded-md border border-border px-2 text-sm" }), _jsx("button", { type: "button", onClick: () => setFilters(filters.filter((_, idx) => idx !== i)), className: "col-span-1 grid h-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, i))), _jsx("button", { type: "button", onClick: () => setFilters([...filters, { field: 'label', operator: 'eq', value: '' }]), className: "text-xs font-semibold text-brand-700 hover:underline", children: "+ Adicionar filtro" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => previewMut.mutate(), disabled: previewMut.isPending, className: "h-9 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground/80 hover:bg-muted/40", children: previewMut.isPending ? 'Calculando...' : 'Pré-visualizar' }), preview && (_jsxs("span", { className: "text-sm font-semibold text-brand-700", children: [preview.estimatedSize, " contato(s) corresponde(m)"] }))] }), preview && preview.sample.length > 0 && (_jsxs("div", { className: "rounded-md border border-border bg-muted/40 p-2", children: [_jsx("p", { className: "text-xs font-semibold text-muted-foreground", children: "Amostra:" }), _jsx("ul", { className: "mt-1 text-xs text-foreground/80", children: preview.sample.map((s) => (_jsxs("li", { children: [s.name, " ", s.email && _jsxs("span", { className: "text-muted-foreground", children: ["\u00B7 ", s.email] })] }, s.id))) })] }))] }), _jsxs("footer", { className: "flex items-center justify-end gap-2 border-t border-border p-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "h-9 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground/80 hover:bg-muted/40", children: "Cancelar" }), _jsx("button", { type: "button", onClick: () => createMut.mutate(), disabled: createMut.isPending || !name.trim(), className: "h-9 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50", children: createMut.isPending ? 'Salvando...' : 'Criar audiência' })] })] }) }));
}
