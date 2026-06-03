import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { activitiesApi } from '@/api/activities.api';
import { extractErrorMessage } from '@/lib/api';
const TYPES = [
    { value: 'CALL', label: 'Ligação' },
    { value: 'MEETING', label: 'Reunião' },
    { value: 'TASK', label: 'Tarefa' },
    { value: 'DEADLINE', label: 'Prazo' },
    { value: 'EMAIL', label: 'E-mail' },
    { value: 'LUNCH', label: 'Almoço' },
];
const PRIORITIES = [
    { value: 'LOW', label: 'Baixa' },
    { value: 'MEDIUM', label: 'Média' },
    { value: 'HIGH', label: 'Alta' },
];
export function NewActivityModal({ open, onClose }) {
    const qc = useQueryClient();
    const [subject, setSubject] = useState('');
    const [type, setType] = useState('TASK');
    const [priority, setPriority] = useState('MEDIUM');
    const [dueAt, setDueAt] = useState('');
    const [durationMin, setDurationMin] = useState('30');
    const m = useMutation({
        mutationFn: () => activitiesApi.create({
            subject,
            type,
            priority,
            dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
            durationMin: Number(durationMin || 30),
        }),
        onSuccess: async () => {
            toast.success('Atividade criada!');
            await qc.invalidateQueries({ queryKey: ['activities'] });
            await qc.invalidateQueries({ queryKey: ['activities-counters'] });
            reset();
            onClose();
        },
        onError: (err) => toast.error(extractErrorMessage(err, 'Falha ao criar.')),
    });
    function reset() {
        setSubject('');
        setType('TASK');
        setPriority('MEDIUM');
        setDueAt('');
        setDurationMin('30');
    }
    function onSubmit(e) {
        e.preventDefault();
        if (!subject.trim()) {
            toast.error('Informe um assunto.');
            return;
        }
        m.mutate();
    }
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-xl bg-card shadow-elevated", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-border p-5", children: [_jsx("h3", { className: "text-lg font-bold text-foreground", children: "Nova atividade" }), _jsx("button", { type: "button", onClick: onClose, className: "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted", "aria-label": "Fechar", children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsxs("form", { onSubmit: onSubmit, className: "space-y-4 p-5", children: [_jsx(Input, { label: "Assunto", value: subject, onChange: (e) => setSubject(e.target.value), placeholder: "Ex: Liga\u00E7\u00E3o de follow-up", autoFocus: true, required: true }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("span", { className: "field-label", children: "Tipo" }), _jsx("select", { value: type, onChange: (e) => setType(e.target.value), className: "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200", children: TYPES.map((t) => (_jsx("option", { value: t.value, children: t.label }, t.value))) })] }), _jsxs("div", { children: [_jsx("span", { className: "field-label", children: "Prioridade" }), _jsx("select", { value: priority, onChange: (e) => setPriority(e.target.value), className: "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200", children: PRIORITIES.map((p) => (_jsx("option", { value: p.value, children: p.label }, p.value))) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Input, { label: "Vencimento", type: "datetime-local", value: dueAt, onChange: (e) => setDueAt(e.target.value) }), _jsx(Input, { label: "Dura\u00E7\u00E3o (min)", type: "number", min: 0, value: durationMin, onChange: (e) => setDurationMin(e.target.value) })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [_jsx(Button, { variant: "ghost", type: "button", onClick: onClose, disabled: m.isPending, children: "Cancelar" }), _jsx(Button, { type: "submit", loading: m.isPending, children: "Criar" })] })] })] }) }));
}
