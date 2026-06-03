import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Users, Building2, Trophy, Inbox, CalendarCheck, CheckCircle2, XCircle, } from 'lucide-react';
import { settingsApi } from '@/api/settings.api';
import { cn } from '@/lib/cn';
export function UsagePage() {
    const q = useQuery({ queryKey: ['usage'], queryFn: settingsApi.usage });
    if (q.isLoading) {
        return _jsx("div", { className: "text-sm text-muted-foreground", children: "Carregando uso\u2026" });
    }
    const u = q.data;
    if (!u) {
        return _jsx("div", { className: "text-sm text-muted-foreground", children: "Sem dados de uso." });
    }
    const usersUsedPct = Math.min(100, Math.round((u.limits.users.used / Math.max(u.limits.users.max, 1)) * 100));
    return (_jsxs("div", { className: "mx-auto max-w-5xl", children: [_jsxs("header", { className: "mb-6", children: [_jsx("h1", { className: "text-2xl font-extrabold tracking-tight text-foreground", children: "Usage" }), _jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: ["Plano atual: ", _jsx("span", { className: "rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700", children: u.plan })] })] }), _jsxs("section", { className: "mb-6 rounded-xl border border-border bg-card p-6 shadow-card", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold text-foreground", children: "Usu\u00E1rios ativos" }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Inclua sua equipe sem ultrapassar o plano." })] }), _jsxs("div", { className: "text-right text-sm font-bold text-foreground", children: [u.limits.users.used, " / ", u.limits.users.max] })] }), _jsx("div", { className: "mt-4 h-2 overflow-hidden rounded-full bg-muted", children: _jsx("div", { className: cn('h-full rounded-full transition-all', usersUsedPct >= 90
                                ? 'bg-danger'
                                : usersUsedPct >= 70
                                    ? 'bg-warning'
                                    : 'bg-brand-500'), style: { width: `${usersUsedPct}%` } }) })] }), _jsxs("section", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: [_jsx(Counter, { icon: Users, label: "Contatos", value: u.counts.contacts }), _jsx(Counter, { icon: Building2, label: "Empresas", value: u.counts.companies }), _jsx(Counter, { icon: Trophy, label: "Deals abertos", value: u.counts.deals.open, accent: "brand" }), _jsx(Counter, { icon: CheckCircle2, label: "Deals ganhos", value: u.counts.deals.won, accent: "success" }), _jsx(Counter, { icon: XCircle, label: "Deals perdidos", value: u.counts.deals.lost, accent: "danger" }), _jsx(Counter, { icon: CalendarCheck, label: "Atividades", value: u.counts.activities }), _jsx(Counter, { icon: Inbox, label: "Leads", value: u.counts.leads })] })] }));
}
function Counter({ icon: Icon, label, value, accent = 'brand', }) {
    const colors = {
        brand: 'bg-brand-50 text-brand-600',
        success: 'bg-success/10 text-success',
        danger: 'bg-danger/10 text-danger',
        warning: 'bg-warning/15 text-warning',
    };
    return (_jsxs("div", { className: "rounded-xl border border-border bg-card p-5 shadow-card", children: [_jsx("div", { className: cn('grid h-10 w-10 place-items-center rounded-lg', colors[accent]), children: _jsx(Icon, { className: "h-5 w-5" }) }), _jsx("div", { className: "mt-4 text-3xl font-extrabold tracking-tight text-foreground", children: value }), _jsx("div", { className: "text-sm font-medium text-muted-foreground", children: label })] }));
}
