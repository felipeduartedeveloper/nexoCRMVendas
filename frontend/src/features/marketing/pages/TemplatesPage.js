import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Mail, Plus, Trash2, X } from 'lucide-react';
import { marketingApi } from '@/api/marketing.api';
export function TemplatesPage() {
    const qc = useQueryClient();
    const [editing, setEditing] = useState(null);
    const { data = [], isLoading } = useQuery({
        queryKey: ['marketing', 'templates'],
        queryFn: marketingApi.listTemplates,
    });
    const duplicateMut = useMutation({
        mutationFn: (id) => marketingApi.duplicateTemplate(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'templates'] }),
    });
    const deleteMut = useMutation({
        mutationFn: (id) => marketingApi.deleteTemplate(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'templates'] }),
    });
    return (_jsxs("div", { className: "flex h-full flex-col", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-foreground", children: "Modelos de email" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Reutilize designs e textos prontos com merge fields ", `{{contact.firstName}}`, "."] })] }), _jsxs("button", { type: "button", onClick: () => setEditing('new'), className: "inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700", children: [_jsx(Plus, { className: "h-4 w-4" }), " Novo modelo"] })] }), _jsxs("div", { className: "flex-1 overflow-auto p-6", children: [isLoading && _jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando..." }), !isLoading && data.length === 0 && (_jsxs("div", { className: "grid place-items-center p-16 text-center", children: [_jsx(Mail, { className: "h-12 w-12 text-muted-foreground/50" }), _jsx("h2", { className: "mt-3 text-base font-semibold text-foreground", children: "Sem modelos ainda" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Crie modelos reutiliz\u00E1veis pra agilizar suas campanhas." })] })), !isLoading && data.length > 0 && (_jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3", children: data.map((t) => (_jsxs("div", { className: "rounded-lg border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-elevated", children: [_jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "min-w-0", children: [_jsx("h3", { className: "truncate font-semibold text-foreground", children: t.name }), t.category && (_jsx("span", { className: "mt-1 inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: t.category }))] }) }), _jsx("p", { className: "mt-2 text-sm text-foreground/80", children: t.subject }), _jsx("div", { className: "mt-3 line-clamp-3 max-h-16 overflow-hidden rounded-md bg-muted/40 p-2 text-xs text-muted-foreground", dangerouslySetInnerHTML: { __html: t.bodyHtml.slice(0, 200) } }), _jsxs("div", { className: "mt-3 flex justify-end gap-1", children: [_jsx("button", { type: "button", onClick: () => duplicateMut.mutate(t.id), title: "Duplicar", className: "grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted", children: _jsx(Copy, { className: "h-3.5 w-3.5" }) }), _jsx("button", { type: "button", onClick: () => setEditing(t), className: "rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground/80 hover:bg-muted/40", children: "Editar" }), _jsx("button", { type: "button", onClick: () => {
                                                if (confirm('Apagar modelo?'))
                                                    deleteMut.mutate(t.id);
                                            }, title: "Apagar", className: "grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-danger", children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) })] })] }, t.id))) }))] }), editing && _jsx(TemplateEditor, { template: editing, onClose: () => setEditing(null) })] }));
}
function TemplateEditor({ template, onClose, }) {
    const qc = useQueryClient();
    const isNew = template === 'new';
    const t = isNew ? null : template;
    const [name, setName] = useState(t?.name ?? '');
    const [subject, setSubject] = useState(t?.subject ?? '');
    const [category, setCategory] = useState(t?.category ?? '');
    const [bodyHtml, setBodyHtml] = useState(t?.bodyHtml ?? '<p>Olá {{contact.firstName}},</p>');
    const mut = useMutation({
        mutationFn: () => {
            const payload = { name, subject, category: category || undefined, bodyHtml };
            return isNew
                ? marketingApi.createTemplate(payload)
                : marketingApi.updateTemplate(t.id, payload);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['marketing', 'templates'] });
            onClose();
        },
    });
    return (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4", children: _jsxs("div", { className: "flex h-[80vh] w-full max-w-4xl flex-col rounded-xl bg-card shadow-elevated", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-border p-5", children: [_jsx("h2", { className: "text-lg font-bold text-foreground", children: isNew ? 'Novo modelo' : 'Editar modelo' }), _jsx("button", { type: "button", onClick: onClose, "aria-label": "Fechar", className: "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted", children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "grid flex-1 grid-cols-2 gap-4 overflow-hidden p-5", children: [_jsxs("div", { className: "flex flex-col gap-3 overflow-y-auto", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Nome" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Assunto" }), _jsx("input", { value: subject, onChange: (e) => setSubject(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Categoria" }), _jsx("input", { value: category, onChange: (e) => setCategory(e.target.value), placeholder: "Promo, Onboarding, Newsletter...", className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("label", { className: "block flex-1", children: [_jsx("span", { className: "field-label", children: "HTML" }), _jsx("textarea", { value: bodyHtml, onChange: (e) => setBodyHtml(e.target.value), rows: 16, className: "h-full w-full rounded-md border border-border px-2 py-1.5 font-mono text-xs" })] })] }), _jsxs("div", { className: "overflow-auto rounded-md border border-border bg-card p-3", children: [_jsx("p", { className: "mb-2 text-xs font-semibold uppercase text-muted-foreground", children: "Preview" }), _jsxs("div", { className: "rounded border border-border/50 p-3", children: [_jsx("p", { className: "mb-2 text-sm font-semibold text-foreground", children: subject || '(sem assunto)' }), _jsx("div", { className: "text-sm", dangerouslySetInnerHTML: { __html: bodyHtml } })] })] })] }), _jsxs("footer", { className: "flex items-center justify-end gap-2 border-t border-border p-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "h-9 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground/80 hover:bg-muted/40", children: "Cancelar" }), _jsx("button", { type: "button", onClick: () => mut.mutate(), disabled: mut.isPending || !name.trim(), className: "h-9 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50", children: mut.isPending ? 'Salvando...' : 'Salvar' })] })] }) }));
}
