import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Trophy, Users, CalendarCheck, TrendingUp, ArrowUpRight, Phone, Mail, Calendar, CheckCircle2, Plus, } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuthStore } from '@/store/auth.store';
const kpis = [
    { label: 'Deals abertos', value: 1, hint: '+1 esta semana', icon: Trophy, color: 'brand' },
    { label: 'Valor do pipeline', value: 'R$ 30.000', hint: 'em 1 deal', icon: TrendingUp, color: 'success' },
    { label: 'Atividades hoje', value: 2, hint: 'a vencer hoje', icon: CalendarCheck, color: 'warning' },
    { label: 'Novos contatos', value: 2, hint: 'esta semana', icon: Users, color: 'brand' },
];
const activities = [
    {
        icon: Phone,
        title: 'Final attempt — Tony Turner',
        when: 'Hoje · 10:00',
        badge: 'Ligação',
    },
    {
        icon: Calendar,
        title: 'Context call — MoveEr',
        when: 'Amanhã · 14:30',
        badge: 'Reunião',
    },
    {
        icon: Mail,
        title: 'Enviar proposta para MoveEr',
        when: 'Sexta · 09:00',
        badge: 'E-mail',
    },
];
export function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const firstName = (user?.name ?? '').split(' ')[0] || 'time';
    return (_jsxs("div", { className: "mx-auto max-w-7xl", children: [_jsx(PageHeader, { title: `Bem-vindo de volta, ${firstName} 👋`, subtitle: "Aqui est\u00E1 um resumo do seu pipeline hoje.", actions: _jsxs(_Fragment, { children: [_jsx(Link, { to: "/setup-guide", children: _jsxs(Button, { variant: "outline", children: [_jsx(CheckCircle2, { className: "h-4 w-4" }), " Guia de configura\u00E7\u00E3o"] }) }), _jsx(Link, { to: "/deals/new", children: _jsxs(Button, { children: [_jsx(Plus, { className: "h-4 w-4" }), " Novo neg\u00F3cio"] }) })] }) }), _jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: kpis.map((k) => (_jsxs("div", { className: "rounded-xl border border-border bg-card p-5 shadow-card", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: 'grid h-10 w-10 place-items-center rounded-lg ' +
                                        (k.color === 'success'
                                            ? 'bg-success/10 text-success'
                                            : k.color === 'warning'
                                                ? 'bg-warning/15 text-warning'
                                                : 'bg-brand-50 text-brand-600'), children: _jsx(k.icon, { className: "h-5 w-5" }) }), _jsx(ArrowUpRight, { className: "h-4 w-4 text-muted-foreground/70" })] }), _jsx("div", { className: "mt-4 text-3xl font-extrabold tracking-tight text-foreground", children: k.value }), _jsx("div", { className: "text-sm font-medium text-muted-foreground", children: k.label }), _jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: k.hint })] }, k.label))) }), _jsxs("div", { className: "mt-6 grid gap-6 lg:grid-cols-3", children: [_jsxs("div", { className: "rounded-xl border border-border bg-card p-5 shadow-card lg:col-span-2", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-base font-bold text-foreground", children: "Pipeline \u00B7 Vendas (padr\u00E3o)" }), _jsx(Link, { to: "/deals", className: "text-sm font-semibold text-brand-600 hover:underline", children: "Ver pipeline \u2192" })] }), _jsx("div", { className: "grid grid-cols-3 gap-3", children: ['Novo deal', 'Contato feito', 'Qualificado'].map((label, idx) => (_jsxs("div", { className: "rounded-lg bg-muted/40 p-3", children: [_jsx("div", { className: "mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground", children: label }), idx === 1 ? (_jsxs("div", { className: "rounded-lg border border-border bg-card p-3 shadow-card", children: [_jsx("div", { className: "text-sm font-semibold text-foreground", children: "[Sample] Tony Turner / MoveEr" }), _jsx("div", { className: "mt-0.5 text-xs text-muted-foreground", children: "Tony Turner" }), _jsx("span", { className: "mt-2 inline-flex rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success", children: "\u00A3 30.000" })] })) : (_jsx("div", { className: "grid h-20 place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground/70", children: "Arraste um deal aqui" }))] }, label))) })] }), _jsxs("div", { className: "rounded-xl border border-border bg-card p-5 shadow-card", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-base font-bold text-foreground", children: "Pr\u00F3ximas atividades" }), _jsx(Link, { to: "/activities", className: "text-sm font-semibold text-brand-600 hover:underline", children: "Ver todas \u2192" })] }), _jsx("ul", { className: "space-y-2", children: activities.map((a) => (_jsxs("li", { className: "flex items-center gap-3", children: [_jsx("span", { className: "grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700", children: _jsx(a.icon, { className: "h-4 w-4" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("div", { className: "truncate text-sm font-semibold text-foreground", children: a.title }), _jsx("div", { className: "text-xs text-muted-foreground", children: a.when })] }), _jsx("span", { className: "hidden rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/80 sm:inline", children: a.badge })] }, a.title))) })] })] })] }));
}
