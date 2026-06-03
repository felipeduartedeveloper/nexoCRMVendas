import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Activity as ActivityIcon, Mail, StickyNote, Paperclip, Trophy, XCircle, Trash2, Calendar, } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { dealsApi } from '@/api/deals.api';
import { activitiesApi } from '@/api/activities.api';
import { formatMoney } from '@/lib/format';
import { extractErrorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
const TABS = [
    { value: 'activities', label: 'Atividades', icon: ActivityIcon },
    { value: 'notes', label: 'Notas', icon: StickyNote },
    { value: 'email', label: 'E-mails', icon: Mail },
    { value: 'files', label: 'Arquivos', icon: Paperclip },
];
export function DealDetailDrawer({ open, dealId, pipeline, onClose }) {
    const qc = useQueryClient();
    const [tab, setTab] = useState('activities');
    const [editTitle, setEditTitle] = useState('');
    const [editValue, setEditValue] = useState('');
    const dealQ = useQuery({
        queryKey: ['deal', dealId],
        queryFn: () => dealsApi.one(dealId),
        enabled: open && !!dealId,
    });
    const activitiesQ = useQuery({
        queryKey: ['deal-activities', dealId],
        queryFn: () => activitiesApi.list({ dealId: dealId, limit: 50 }),
        enabled: open && !!dealId && tab === 'activities',
    });
    useEffect(() => {
        if (dealQ.data) {
            setEditTitle(dealQ.data.title);
            setEditValue(String(dealQ.data.value));
        }
    }, [dealQ.data?.id]);
    const updateMutation = useMutation({
        mutationFn: (data) => dealsApi.update(dealId, data),
        onSuccess: async () => {
            toast.success('Salvo!');
            await qc.invalidateQueries({ queryKey: ['deal', dealId] });
            if (pipeline?.id) {
                await qc.invalidateQueries({ queryKey: ['deals', 'kanban', pipeline.id] });
                await qc.invalidateQueries({ queryKey: ['deals-summary', pipeline.id] });
            }
        },
        onError: (err) => toast.error(extractErrorMessage(err, 'Falha ao salvar.')),
    });
    const winMutation = useMutation({
        mutationFn: () => dealsApi.win(dealId),
        onSuccess: async () => {
            toast.success('Deal marcado como ganho!');
            await refreshAll();
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
    });
    const loseMutation = useMutation({
        mutationFn: (reason) => dealsApi.lose(dealId, reason),
        onSuccess: async () => {
            toast('Deal marcado como perdido.');
            await refreshAll();
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
    });
    const deleteMutation = useMutation({
        mutationFn: () => dealsApi.remove(dealId),
        onSuccess: async () => {
            toast.success('Deal removido.');
            onClose();
            await refreshAll();
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
    });
    async function refreshAll() {
        if (pipeline?.id) {
            await qc.invalidateQueries({ queryKey: ['deals', 'kanban', pipeline.id] });
            await qc.invalidateQueries({ queryKey: ['deals-summary', pipeline.id] });
        }
        await qc.invalidateQueries({ queryKey: ['deal', dealId] });
    }
    const deal = dealQ.data;
    const stage = deal && pipeline?.stages.find((s) => s.id === deal.stageId);
    return (_jsx(Drawer, { open: open, onClose: onClose, width: "lg", title: deal ? deal.title : 'Carregando…', subtitle: deal && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-sm font-semibold text-success", children: formatMoney(deal.value, deal.currency) }), stage && (_jsx("span", { className: "rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700", children: stage.name })), _jsx("span", { className: cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide', deal.status === 'WON'
                        ? 'bg-success/10 text-success'
                        : deal.status === 'LOST'
                            ? 'bg-danger/10 text-danger'
                            : deal.status === 'DELETED'
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-muted text-foreground/80'), children: deal.status })] })), headerActions: deal &&
            deal.status === 'OPEN' && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsxs(Button, { size: "sm", onClick: () => winMutation.mutate(), loading: winMutation.isPending, children: [_jsx(Trophy, { className: "h-4 w-4" }), " Ganhei"] }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
                        const reason = window.prompt('Motivo da perda? (opcional)');
                        if (reason !== null)
                            loseMutation.mutate(reason || undefined);
                    }, loading: loseMutation.isPending, children: [_jsx(XCircle, { className: "h-4 w-4" }), " Perdi"] }), _jsx("button", { type: "button", onClick: () => {
                        if (window.confirm('Apagar este negócio?'))
                            deleteMutation.mutate();
                    }, className: "grid h-8 w-8 place-items-center rounded-lg text-danger hover:bg-danger/10", "aria-label": "Apagar", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })), children: !deal ? (_jsx("div", { className: "p-8 text-center text-sm text-muted-foreground", children: "Carregando\u2026" })) : (_jsxs("div", { children: [_jsxs("div", { className: "space-y-4 border-b border-border p-5", children: [_jsx(Input, { label: "T\u00EDtulo", value: editTitle, onChange: (e) => setEditTitle(e.target.value), onBlur: () => {
                                if (editTitle && editTitle !== deal.title) {
                                    updateMutation.mutate({ title: editTitle });
                                }
                            } }), _jsx(Input, { label: `Valor (${deal.currency})`, type: "number", min: 0, value: editValue, onChange: (e) => setEditValue(e.target.value), onBlur: () => {
                                const v = Number(editValue);
                                if (Number.isFinite(v) && v !== Number(deal.value)) {
                                    updateMutation.mutate({ value: v });
                                }
                            } }), _jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [_jsx(Field, { label: "Pipeline", children: pipeline?.name ?? '—' }), _jsx(Field, { label: "Etapa", children: stage?.name ?? '—' }), _jsx(Field, { label: "Criado", children: new Date(deal.createdAt).toLocaleString('pt-BR') }), _jsx(Field, { label: "Atualizado", children: new Date(deal.updatedAt).toLocaleString('pt-BR') })] })] }), _jsx("nav", { className: "flex border-b border-border", role: "tablist", children: TABS.map((t) => (_jsxs("button", { role: "tab", "aria-selected": tab === t.value, onClick: () => setTab(t.value), className: cn('flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors', tab === t.value
                            ? 'border-brand-600 text-brand-700'
                            : 'border-transparent text-muted-foreground hover:text-foreground'), children: [_jsx(t.icon, { className: "h-4 w-4" }), " ", t.label] }, t.value))) }), _jsxs("div", { className: "p-5", children: [tab === 'activities' && (_jsx("div", { children: activitiesQ.isLoading ? (_jsx("div", { className: "text-sm text-muted-foreground", children: "Carregando atividades\u2026" })) : !activitiesQ.data?.items?.length ? (_jsx(EmptyState, { icon: ActivityIcon, title: "Nenhuma atividade ainda", subtitle: "Crie liga\u00E7\u00F5es, reuni\u00F5es e tarefas relacionadas a este deal." })) : (_jsx("ul", { className: "space-y-2", children: activitiesQ.data.items.map((a) => (_jsxs("li", { className: "flex items-center gap-3 rounded-lg border border-border p-3", children: [_jsx("span", { className: "grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700", children: _jsx(Calendar, { className: "h-4 w-4" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: cn('text-sm font-semibold text-foreground', a.done && 'text-muted-foreground/70 line-through'), children: a.subject }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [a.dueAt
                                                            ? new Date(a.dueAt).toLocaleString('pt-BR')
                                                            : 'sem prazo', ' ', "\u00B7 ", a.type] })] })] }, a.id))) })) })), tab === 'notes' && (_jsx(EmptyState, { icon: StickyNote, title: "Notas em breve", subtitle: "Voc\u00EA poder\u00E1 registrar observa\u00E7\u00F5es livres e anexar a este deal." })), tab === 'email' && (_jsx(EmptyState, { icon: Mail, title: "E-mails sincronizados em breve", subtitle: "Conecte o Gmail/Outlook para vincular conversas a este deal." })), tab === 'files' && (_jsx(EmptyState, { icon: Paperclip, title: "Anexos em breve", subtitle: "PDF, propostas e contratos do deal ficar\u00E3o aqui (upload via MinIO)." }))] })] })) }));
}
function Field({ label, children }) {
    return (_jsxs("div", { children: [_jsx("div", { className: "text-[10px] font-bold uppercase tracking-wide text-muted-foreground", children: label }), _jsx("div", { className: "mt-0.5 truncate text-sm text-foreground/90", children: children })] }));
}
function EmptyState({ icon: Icon, title, subtitle, }) {
    return (_jsxs("div", { className: "grid place-items-center py-10 text-center", children: [_jsx(Icon, { className: "h-8 w-8 text-muted-foreground/50" }), _jsx("p", { className: "mt-2 text-sm font-semibold text-foreground", children: title }), _jsx("p", { className: "mt-1 max-w-xs text-xs text-muted-foreground", children: subtitle })] }));
}
