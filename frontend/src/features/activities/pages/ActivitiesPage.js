import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Phone, Mail, Calendar, CheckSquare, Flag, Utensils, ClipboardList, } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { CalendarSyncBanner } from '../components/CalendarSyncBanner';
import { NewActivityModal } from '../components/NewActivityModal';
import { ActivityDetailDrawer } from '../components/ActivityDetailDrawer';
import { activitiesApi } from '@/api/activities.api';
import { extractErrorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
const TYPE_META = {
    CALL: { label: 'Ligação', icon: Phone, color: 'bg-blue-100 text-blue-700' },
    MEETING: { label: 'Reunião', icon: Calendar, color: 'bg-purple-100 text-purple-700' },
    TASK: { label: 'Tarefa', icon: CheckSquare, color: 'bg-green-100 text-green-700' },
    DEADLINE: { label: 'Prazo', icon: Flag, color: 'bg-red-100 text-red-700' },
    EMAIL: { label: 'E-mail', icon: Mail, color: 'bg-cyan-100 text-cyan-700' },
    LUNCH: { label: 'Almoço', icon: Utensils, color: 'bg-amber-100 text-amber-700' },
};
const PRIORITY_COLOR = {
    HIGH: 'text-danger',
    MEDIUM: 'text-warning',
    LOW: 'text-muted-foreground/70',
};
const SCOPES = [
    { value: 'all', label: 'Todas' },
    { value: 'overdue', label: 'Atrasadas' },
    { value: 'today', label: 'Hoje' },
    { value: 'upcoming', label: 'Próximas' },
];
function formatDateCell(iso) {
    if (!iso)
        return '—';
    try {
        const d = new Date(iso);
        return d.toLocaleString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    catch {
        return '—';
    }
}
export function ActivitiesPage() {
    const qc = useQueryClient();
    const [scope, setScope] = useState('all');
    const [search, setSearch] = useState('');
    const [doneFilter, setDoneFilter] = useState('all');
    const [showNew, setShowNew] = useState(false);
    const [openActivityId, setOpenActivityId] = useState(null);
    const q = useQuery({
        queryKey: ['activities', { scope, search, doneFilter }],
        queryFn: () => activitiesApi.list({
            scope: scope,
            search: search || undefined,
            done: doneFilter === 'all' ? undefined : doneFilter === 'done',
            limit: 200,
        }),
    });
    const counters = useQuery({
        queryKey: ['activities-counters'],
        queryFn: activitiesApi.counters,
    });
    const toggleDone = useMutation({
        mutationFn: ({ id, done }) => activitiesApi.markDone(id, done),
        onMutate: async ({ id, done }) => {
            await qc.cancelQueries({ queryKey: ['activities'] });
            const prev = qc.getQueryData(['activities', { scope, search, doneFilter }]);
            qc.setQueryData(['activities', { scope, search, doneFilter }], (old) => {
                if (!old)
                    return old;
                return {
                    ...old,
                    items: old.items.map((a) => (a.id === id ? { ...a, done } : a)),
                };
            });
            return { prev };
        },
        onError: (err, _vars, ctx) => {
            if (ctx?.prev)
                qc.setQueryData(['activities', { scope, search, doneFilter }], ctx.prev);
            toast.error(extractErrorMessage(err, 'Falha ao atualizar.'));
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ['activities'] });
            qc.invalidateQueries({ queryKey: ['activities-counters'] });
        },
    });
    const items = q.data?.items ?? [];
    const totalCount = q.data?.total ?? 0;
    return (_jsxs("div", { className: "mx-auto max-w-[1600px]", children: [_jsx(PageHeader, { title: "Atividades", subtitle: `${totalCount} atividades · ligações, reuniões, tarefas e prazos`, actions: _jsxs(Button, { onClick: () => setShowNew(true), children: [_jsx(Plus, { className: "h-4 w-4" }), " Nova atividade"] }) }), _jsx(CalendarSyncBanner, {}), _jsxs("div", { className: "mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [_jsx(Counter, { label: "Atrasadas", value: counters.data?.overdue ?? 0, color: "text-danger" }), _jsx(Counter, { label: "Hoje", value: counters.data?.today ?? 0, color: "text-warning" }), _jsx(Counter, { label: "Pr\u00F3ximas", value: counters.data?.upcoming ?? 0, color: "text-brand-600" }), _jsx(Counter, { label: "Conclu\u00EDdas", value: counters.data?.done ?? 0, color: "text-success" })] }), _jsxs("div", { className: "rounded-xl border border-border bg-card shadow-card", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3 border-b border-border p-3", children: [_jsxs("div", { className: "relative flex w-full max-w-sm items-center", children: [_jsx(Search, { className: "pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground/70" }), _jsx("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Buscar por assunto\u2026", className: "h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" })] }), _jsx("div", { className: "flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1", children: SCOPES.map((s) => (_jsx("button", { onClick: () => setScope(s.value), className: cn('rounded-md px-3 py-1 text-xs font-semibold transition-colors', scope === s.value
                                        ? 'bg-card text-brand-700 shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'), children: s.label }, s.value))) }), _jsx("div", { className: "flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1", children: ['all', 'open', 'done'].map((v) => (_jsx("button", { onClick: () => setDoneFilter(v), className: cn('rounded-md px-3 py-1 text-xs font-semibold transition-colors', doneFilter === v
                                        ? 'bg-card text-brand-700 shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'), children: v === 'all' ? 'Todas' : v === 'open' ? 'Em aberto' : 'Concluídas' }, v))) }), _jsxs(Button, { variant: "outline", size: "sm", className: "ml-auto", children: [_jsx(Filter, { className: "h-4 w-4" }), " Mais filtros"] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border/50 bg-muted/40 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground", children: [_jsx("th", { className: "w-10 px-4 py-2.5", children: "Done" }), _jsx("th", { className: "px-4 py-2.5", children: "Subject" }), _jsx("th", { className: "px-4 py-2.5", children: "Deal" }), _jsx("th", { className: "px-4 py-2.5", children: "Priority" }), _jsx("th", { className: "px-4 py-2.5", children: "Contact person" }), _jsx("th", { className: "px-4 py-2.5", children: "Email" }), _jsx("th", { className: "px-4 py-2.5", children: "Phone" }), _jsx("th", { className: "px-4 py-2.5", children: "Organization" }), _jsx("th", { className: "px-4 py-2.5", children: "Due date" }), _jsx("th", { className: "px-4 py-2.5", children: "Duration" }), _jsx("th", { className: "px-4 py-2.5", children: "Assigned to" })] }) }), _jsx("tbody", { children: q.isLoading ? (_jsx("tr", { children: _jsx("td", { colSpan: 11, className: "p-12 text-center text-muted-foreground", children: "Carregando atividades\u2026" }) })) : !items.length ? (_jsx("tr", { children: _jsxs("td", { colSpan: 11, className: "p-12 text-center", children: [_jsx(ClipboardList, { className: "mx-auto mb-2 h-8 w-8 text-muted-foreground/50" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma atividade nesse filtro." })] }) })) : (items.map((a) => {
                                        const meta = TYPE_META[a.type];
                                        return (_jsxs("tr", { onClick: () => setOpenActivityId(a.id), className: cn('cursor-pointer border-b border-border/50 hover:bg-brand-50/40', a.done && 'bg-muted/40/60'), children: [_jsx("td", { className: "px-4 py-2.5", onClick: (e) => e.stopPropagation(), children: _jsx("input", { type: "checkbox", checked: a.done, onChange: (e) => toggleDone.mutate({ id: a.id, done: e.target.checked }), className: "h-4 w-4 cursor-pointer rounded border-border text-brand-600 focus:ring-brand-300" }) }), _jsx("td", { className: "px-4 py-2.5", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: cn('grid h-7 w-7 place-items-center rounded-lg', meta.color), children: _jsx(meta.icon, { className: "h-3.5 w-3.5" }) }), _jsx("span", { className: cn('truncate font-semibold text-foreground', a.done && 'text-muted-foreground/70 line-through'), children: a.subject })] }) }), _jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: a.dealId ? (_jsxs("span", { className: "rounded bg-muted px-2 py-0.5 font-mono text-[11px]", children: [a.dealId.slice(0, 8), "\u2026"] })) : ('—') }), _jsx("td", { className: "px-4 py-2.5", children: _jsxs("span", { className: cn('inline-flex items-center gap-1 text-xs font-semibold', PRIORITY_COLOR[a.priority]), children: [_jsx(Flag, { className: "h-3 w-3" }), a.priority === 'HIGH' ? 'Alta' : a.priority === 'MEDIUM' ? 'Média' : 'Baixa'] }) }), _jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: a.contactId ? (_jsxs("span", { className: "font-mono text-[11px]", children: [a.contactId.slice(0, 8), "\u2026"] })) : ('—') }), _jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: "\u2014" }), _jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: "\u2014" }), _jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: a.orgCompanyId ? (_jsxs("span", { className: "font-mono text-[11px]", children: [a.orgCompanyId.slice(0, 8), "\u2026"] })) : ('—') }), _jsx("td", { className: "px-4 py-2.5 text-foreground/80", children: formatDateCell(a.dueAt) }), _jsxs("td", { className: "px-4 py-2.5 text-foreground/80", children: [a.durationMin, " min"] }), _jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: a.ownerUserId ? (_jsxs("span", { className: "font-mono text-[11px]", children: [a.ownerUserId.slice(0, 8), "\u2026"] })) : ('—') })] }, a.id));
                                    })) })] }) })] }), _jsx(NewActivityModal, { open: showNew, onClose: () => setShowNew(false) }), _jsx(ActivityDetailDrawer, { open: !!openActivityId, activityId: openActivityId, onClose: () => setOpenActivityId(null) })] }));
}
function Counter({ label, value, color }) {
    return (_jsxs("div", { className: "rounded-xl border border-border bg-card p-4 shadow-card", children: [_jsx("div", { className: cn('text-2xl font-extrabold tracking-tight', color), children: value }), _jsx("div", { className: "text-xs font-medium text-muted-foreground", children: label })] }));
}
