import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Clock, User } from 'lucide-react';
import { contactsApi } from '@/api/contacts.api';
import { initials } from '@/lib/format';
function groupByDate(items) {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const groups = {};
    items.forEach((c) => {
        const d = new Date(c.updatedAt);
        let key;
        const diffDays = Math.floor((startOfToday.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000);
        if (diffDays <= 0)
            key = 'Hoje';
        else if (diffDays === 1)
            key = 'Ontem';
        else if (diffDays <= 7)
            key = 'Esta semana';
        else if (diffDays <= 30)
            key = 'Este mês';
        else
            key = 'Anterior';
        if (!groups[key])
            groups[key] = [];
        groups[key].push(c);
    });
    return groups;
}
export function TimelineTab() {
    const q = useQuery({
        queryKey: ['contacts-timeline'],
        queryFn: contactsApi.timeline,
    });
    if (q.isLoading) {
        return _jsx("div", { className: "p-12 text-center text-sm text-muted-foreground", children: "Carregando timeline\u2026" });
    }
    const items = q.data ?? [];
    if (!items.length) {
        return (_jsx("div", { className: "p-12 text-center text-sm text-muted-foreground", children: "Sua timeline est\u00E1 vazia. Atualiza\u00E7\u00F5es em contatos aparecer\u00E3o aqui." }));
    }
    const grouped = groupByDate(items);
    return (_jsx("div", { className: "p-5", children: Object.entries(grouped).map(([label, list]) => (_jsxs("div", { className: "mb-6 last:mb-0", children: [_jsxs("div", { className: "mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground", children: [_jsx(Clock, { className: "h-3.5 w-3.5" }), " ", label] }), _jsx("ul", { className: "space-y-2", children: list.map((c) => (_jsxs("li", { className: "flex items-center gap-3 rounded-lg border border-border bg-card p-3", children: [_jsx("span", { className: "grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700", children: initials(c.name) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-semibold text-foreground", children: c.name }), _jsx("div", { className: "text-xs text-muted-foreground", children: c.email ?? 'Sem e-mail' })] }), _jsx("span", { className: "text-xs text-muted-foreground", children: new Date(c.updatedAt).toLocaleString('pt-BR', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }) }), _jsx(User, { className: "h-4 w-4 text-muted-foreground/50" })] }, c.id))) })] }, label))) }));
}
