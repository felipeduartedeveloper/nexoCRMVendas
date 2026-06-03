import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { customFieldsApi } from '@/api/settings.api';
import { extractErrorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
const ENTITIES = ['CONTACT', 'COMPANY', 'DEAL', 'LEAD', 'ACTIVITY'];
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
];
export function DataFieldsPage() {
    const [entity, setEntity] = useState('DEAL');
    const [openNew, setOpenNew] = useState(false);
    const qc = useQueryClient();
    const q = useQuery({
        queryKey: ['custom-fields', entity],
        queryFn: () => customFieldsApi.list(entity),
    });
    const remove = useMutation({
        mutationFn: (id) => customFieldsApi.remove(id),
        onSuccess: async () => {
            toast.success('Campo removido.');
            await qc.invalidateQueries({ queryKey: ['custom-fields', entity] });
        },
    });
    const items = q.data ?? [];
    return (_jsxs("div", { className: "mx-auto max-w-5xl", children: [_jsxs("header", { className: "mb-6 flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-extrabold tracking-tight text-foreground", children: "Data fields" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Personalize campos extras em cada entidade." })] }), _jsxs(Button, { onClick: () => setOpenNew(true), children: [_jsx(Plus, { className: "h-4 w-4" }), " Novo campo"] })] }), _jsx("div", { className: "mb-4 flex flex-wrap gap-2", children: ENTITIES.map((e) => (_jsx("button", { onClick: () => setEntity(e), className: cn('rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors', entity === e
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-border bg-card text-muted-foreground hover:border-border'), children: e }, e))) }), _jsx("div", { className: "overflow-hidden rounded-xl border border-border bg-card shadow-card", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border/50 bg-muted/40 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground", children: [_jsx("th", { className: "px-4 py-2.5", children: "Label" }), _jsx("th", { className: "px-4 py-2.5", children: "Key" }), _jsx("th", { className: "px-4 py-2.5", children: "Tipo" }), _jsx("th", { className: "px-4 py-2.5", children: "Op\u00E7\u00F5es" }), _jsx("th", { className: "px-4 py-2.5", children: "Obrigat\u00F3rio" }), _jsx("th", { className: "px-4 py-2.5" })] }) }), _jsx("tbody", { children: q.isLoading ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "p-12 text-center text-muted-foreground", children: "Carregando\u2026" }) })) : !items.length ? (_jsx("tr", { children: _jsxs("td", { colSpan: 6, className: "p-12 text-center text-sm text-muted-foreground", children: [_jsx(AlertCircle, { className: "mx-auto mb-2 h-6 w-6 text-muted-foreground/50" }), "Nenhum campo customizado em ", entity, "."] }) })) : (items.map((f) => (_jsxs("tr", { className: "border-b border-border/50 hover:bg-brand-50/30", children: [_jsx("td", { className: "px-4 py-2.5 font-semibold text-foreground", children: f.label }), _jsx("td", { className: "px-4 py-2.5 font-mono text-xs text-muted-foreground", children: f.key }), _jsx("td", { className: "px-4 py-2.5", children: _jsx("span", { className: "rounded bg-muted px-2 py-0.5 text-[11px] font-bold uppercase", children: f.dataType }) }), _jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: f.options?.length ? f.options.join(', ') : '—' }), _jsx("td", { className: "px-4 py-2.5", children: f.required ? (_jsx("span", { className: "text-xs font-bold text-warning", children: "Obrigat\u00F3rio" })) : (_jsx("span", { className: "text-xs text-muted-foreground/70", children: "Opcional" })) }), _jsx("td", { className: "px-4 py-2.5 text-right", children: _jsx("button", { type: "button", onClick: () => {
                                                if (window.confirm('Remover este campo?'))
                                                    remove.mutate(f.id);
                                            }, className: "text-danger hover:text-red-700", "aria-label": "Apagar", children: _jsx(Trash2, { className: "h-4 w-4" }) }) })] }, f.id)))) })] }) }), openNew && (_jsx(NewFieldModal, { entity: entity, onClose: () => setOpenNew(false) }))] }));
}
function NewFieldModal({ entity, onClose }) {
    const qc = useQueryClient();
    const [label, setLabel] = useState('');
    const [key, setKey] = useState('');
    const [dataType, setDataType] = useState('TEXT');
    const [options, setOptions] = useState('');
    const [required, setRequired] = useState(false);
    const m = useMutation({
        mutationFn: () => customFieldsApi.create({
            entity,
            label,
            key,
            dataType,
            required,
            options: dataType === 'SELECT' || dataType === 'MULTI_SELECT'
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
    function onSubmit(e) {
        e.preventDefault();
        if (!label.trim() || !key.trim())
            return toast.error('Label e key são obrigatórios.');
        m.mutate();
    }
    const needOptions = dataType === 'SELECT' || dataType === 'MULTI_SELECT';
    return (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4", children: _jsxs("form", { onSubmit: onSubmit, className: "w-full max-w-md space-y-4 rounded-xl bg-card p-6 shadow-elevated", children: [_jsxs("h3", { className: "text-lg font-bold text-foreground", children: ["Novo campo em ", entity] }), _jsx(Input, { label: "Label", value: label, onChange: (e) => {
                        const v = e.target.value;
                        setLabel(v);
                        setKey(v
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '_')
                            .replace(/^_+|_+$/g, ''));
                    }, required: true }), _jsx(Input, { label: "Key (slug, \u00FAnico por entidade)", value: key, onChange: (e) => setKey(e.target.value), required: true }), _jsxs("div", { children: [_jsx("span", { className: "field-label", children: "Tipo" }), _jsx("select", { value: dataType, onChange: (e) => setDataType(e.target.value), className: "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm", children: DATA_TYPES.map((t) => (_jsx("option", { value: t, children: t }, t))) })] }), needOptions && (_jsx(Input, { label: "Op\u00E7\u00F5es (separadas por v\u00EDrgula)", value: options, onChange: (e) => setOptions(e.target.value), placeholder: "Pequeno, M\u00E9dio, Grande" })), _jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", checked: required, onChange: (e) => setRequired(e.target.checked) }), "Campo obrigat\u00F3rio"] }), _jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [_jsx(Button, { variant: "ghost", type: "button", onClick: onClose, children: "Cancelar" }), _jsx(Button, { type: "submit", loading: m.isPending, children: "Criar campo" })] })] }) }));
}
