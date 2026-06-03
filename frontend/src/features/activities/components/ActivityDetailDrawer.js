import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CheckCircle2, Trash2, Calendar, Flag } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
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
export function ActivityDetailDrawer({ open, activityId, onClose }) {
    const qc = useQueryClient();
    const q = useQuery({
        queryKey: ['activity', activityId],
        queryFn: () => activitiesApi.one(activityId),
        enabled: open && !!activityId,
    });
    const [subject, setSubject] = useState('');
    const [notes, setNotes] = useState('');
    const [type, setType] = useState('TASK');
    const [priority, setPriority] = useState('MEDIUM');
    const [dueAt, setDueAt] = useState('');
    useEffect(() => {
        const a = q.data;
        if (a) {
            setSubject(a.subject);
            setNotes(a.notes ?? '');
            setType(a.type);
            setPriority(a.priority);
            setDueAt(a.dueAt ? a.dueAt.slice(0, 16) : '');
        }
    }, [q.data?.id]);
    const update = useMutation({
        mutationFn: (data) => activitiesApi.update(activityId, data),
        onSuccess: async () => {
            toast.success('Salvo!');
            await qc.invalidateQueries({ queryKey: ['activity', activityId] });
            await qc.invalidateQueries({ queryKey: ['activities'] });
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
    });
    const toggle = useMutation({
        mutationFn: () => activitiesApi.markDone(activityId, !q.data?.done),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['activity', activityId] });
            await qc.invalidateQueries({ queryKey: ['activities'] });
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
    });
    const remove = useMutation({
        mutationFn: () => activitiesApi.remove(activityId),
        onSuccess: async () => {
            toast.success('Atividade removida.');
            onClose();
            await qc.invalidateQueries({ queryKey: ['activities'] });
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
    });
    const a = q.data;
    return (_jsx(Drawer, { open: open, onClose: onClose, width: "md", title: a ? a.subject : 'Carregando…', subtitle: a && (_jsxs("span", { className: "text-xs text-muted-foreground", children: [a.dueAt ? new Date(a.dueAt).toLocaleString('pt-BR') : 'Sem prazo', " \u00B7", ' ', a.durationMin, " min"] })), headerActions: a && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsxs(Button, { size: "sm", variant: a.done ? 'outline' : 'primary', onClick: () => toggle.mutate(), loading: toggle.isPending, children: [_jsx(CheckCircle2, { className: "h-4 w-4" }), a.done ? 'Reabrir' : 'Concluir'] }), _jsx("button", { type: "button", onClick: () => {
                        if (window.confirm('Apagar esta atividade?'))
                            remove.mutate();
                    }, className: "grid h-8 w-8 place-items-center rounded-lg text-danger hover:bg-danger/10", "aria-label": "Apagar", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })), children: !a ? (_jsx("div", { className: "p-8 text-center text-sm text-muted-foreground", children: "Carregando\u2026" })) : (_jsxs("div", { className: "space-y-4 p-5", children: [_jsx(Input, { label: "Assunto", value: subject, onChange: (e) => setSubject(e.target.value), onBlur: () => subject !== a.subject && subject && update.mutate({ subject }) }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("span", { className: "field-label", children: "Tipo" }), _jsx("select", { value: type, onChange: (e) => {
                                        const v = e.target.value;
                                        setType(v);
                                        update.mutate({ type: v });
                                    }, className: "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200", children: TYPES.map((t) => (_jsx("option", { value: t.value, children: t.label }, t.value))) })] }), _jsxs("div", { children: [_jsx("span", { className: "field-label", children: "Prioridade" }), _jsxs("select", { value: priority, onChange: (e) => {
                                        const v = e.target.value;
                                        setPriority(v);
                                        update.mutate({ priority: v });
                                    }, className: "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200", children: [_jsx("option", { value: "LOW", children: "Baixa" }), _jsx("option", { value: "MEDIUM", children: "M\u00E9dia" }), _jsx("option", { value: "HIGH", children: "Alta" })] })] })] }), _jsx(Input, { label: "Vencimento", type: "datetime-local", value: dueAt, onChange: (e) => setDueAt(e.target.value), onBlur: () => {
                        const iso = dueAt ? new Date(dueAt).toISOString() : null;
                        if (iso !== a.dueAt)
                            update.mutate({ dueAt: iso });
                    }, leftSlot: _jsx(Calendar, { className: "h-4 w-4" }) }), _jsxs("div", { children: [_jsx("span", { className: "field-label", children: "Notas" }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), onBlur: () => notes !== (a.notes ?? '') && update.mutate({ notes: notes || null }), rows: 5, className: "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200", placeholder: "Adicione notas sobre esta atividade\u2026" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 text-xs text-muted-foreground", children: [_jsxs("div", { children: [_jsx(Flag, { className: "mr-1 inline h-3 w-3" }), "Criada em ", new Date(a.createdAt).toLocaleString('pt-BR')] }), _jsxs("div", { children: ["Atualizada em ", new Date(a.updatedAt).toLocaleString('pt-BR')] })] })] })) }));
}
