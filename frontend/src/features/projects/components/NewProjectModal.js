import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { HEALTH_LABELS, projectsApi, } from '@/api/projects.api';
import { extractErrorMessage } from '@/lib/api';
export function NewProjectModal({ open, onClose, boardId, phases, defaultPhaseId }) {
    const qc = useQueryClient();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [phaseId, setPhaseId] = useState(defaultPhaseId ?? phases[0]?.id ?? '');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [health, setHealth] = useState('ON_TRACK');
    const [error, setError] = useState(null);
    function reset() {
        setTitle('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setHealth('ON_TRACK');
        setError(null);
    }
    const mut = useMutation({
        mutationFn: () => projectsApi.create({
            title: title.trim(),
            description: description.trim() || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            health,
            boardId,
            phaseId: phaseId || undefined,
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['projects'] });
            qc.invalidateQueries({ queryKey: ['projects-summary'] });
            reset();
            onClose();
        },
        onError: (err) => setError(extractErrorMessage(err, 'Erro ao criar projeto')),
    });
    function onSubmit(e) {
        e.preventDefault();
        if (title.trim().length < 2) {
            setError('Título precisa ter pelo menos 2 caracteres.');
            return;
        }
        setError(null);
        mut.mutate();
    }
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4", children: _jsxs("form", { onSubmit: onSubmit, className: "w-full max-w-lg rounded-xl bg-card shadow-elevated", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-border p-5", children: [_jsx("h2", { className: "text-lg font-bold text-foreground", children: "Novo projeto" }), _jsx("button", { type: "button", onClick: onClose, "aria-label": "Fechar", className: "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted", children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "space-y-3 p-5", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "T\u00EDtulo *" }), _jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), required: true, minLength: 2, maxLength: 255, className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Descri\u00E7\u00E3o" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), rows: 3, className: "w-full rounded-md border border-border px-2 py-1.5 text-sm" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Fase" }), _jsx("select", { value: phaseId, onChange: (e) => setPhaseId(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm", children: phases.map((ph) => (_jsx("option", { value: ph.id, children: ph.name }, ph.id))) })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Sa\u00FAde" }), _jsx("select", { value: health, onChange: (e) => setHealth(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm", children: Object.entries(HEALTH_LABELS).map(([k, v]) => (_jsx("option", { value: k, children: v }, k))) })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "In\u00EDcio" }), _jsx("input", { type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "T\u00E9rmino previsto" }), _jsx("input", { type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] })] }), error && (_jsx("div", { className: "rounded-md border border-danger/30 bg-danger/5 p-2 text-sm text-danger", children: error }))] }), _jsxs("footer", { className: "flex items-center justify-end gap-2 border-t border-border p-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "h-9 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground/80 hover:bg-muted/40", children: "Cancelar" }), _jsx("button", { type: "submit", disabled: mut.isPending, className: "h-9 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50", children: mut.isPending ? 'Salvando...' : 'Criar projeto' })] })] }) }));
}
