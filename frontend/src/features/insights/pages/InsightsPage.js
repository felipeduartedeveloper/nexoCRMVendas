import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Target, FileBarChart, Plus, TrendingUp, Search, Sparkles, Trophy, Users, Inbox, CalendarCheck, } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { settingsApi } from '@/api/settings.api';
import { cn } from '@/lib/cn';
const MENU = [
    { value: 'dashboards', label: 'My dashboards', icon: LayoutDashboard },
    { value: 'goals', label: 'Goals', icon: Target },
    { value: 'reports', label: 'My reports', icon: FileBarChart },
];
const SAMPLE_GOALS = [
    { label: 'Deals to win', current: 0, target: 10 },
    { label: 'Revenue this month', current: 0, target: 50000 },
    { label: 'Calls per week', current: 0, target: 50 },
    { label: 'New leads', current: 0, target: 100 },
];
const REPORT_TEMPLATES = [
    {
        icon: Trophy,
        title: 'Deals won by stage',
        desc: 'Performance de conversão por etapa do funil.',
    },
    {
        icon: TrendingUp,
        title: 'Pipeline value over time',
        desc: 'Valor total do pipeline mês a mês.',
    },
    {
        icon: Users,
        title: 'Sales by team member',
        desc: 'Ranking de vendedores por receita gerada.',
    },
    {
        icon: CalendarCheck,
        title: 'Activities completed',
        desc: 'Ligações, reuniões e tarefas concluídas no período.',
    },
    {
        icon: Inbox,
        title: 'Lead conversion rate',
        desc: 'Quantos leads viraram deals.',
    },
];
export function InsightsPage() {
    const [section, setSection] = useState('dashboards');
    const [search, setSearch] = useState('');
    const usageQ = useQuery({ queryKey: ['usage'], queryFn: settingsApi.usage });
    const totalGoals = 4;
    const completedGoals = 0;
    const goalProgress = Math.round((completedGoals / 250) * 100);
    return (_jsxs("div", { className: "mx-auto max-w-[1500px]", children: [_jsx(PageHeader, { title: "Insights", subtitle: "Decis\u00F5es guiadas por dados em tempo real.", actions: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" }), _jsx("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Buscar em Insights\u2026", className: "h-9 w-64 rounded-lg border border-border bg-card pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" })] }) }), _jsxs("div", { className: "grid gap-4 lg:grid-cols-[240px_1fr]", children: [_jsx("aside", { className: "rounded-xl border border-border bg-card p-3 shadow-card", children: _jsx("ul", { className: "space-y-0.5", children: MENU.map((it) => (_jsx("li", { children: _jsxs("button", { type: "button", onClick: () => setSection(it.value), className: cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', section === it.value
                                        ? 'bg-brand-50 text-brand-700'
                                        : 'text-foreground/80 hover:bg-muted'), children: [_jsx(it.icon, { className: "h-4 w-4" }), _jsx("span", { className: "flex-1 text-left", children: it.label }), it.value === 'dashboards' && (_jsx("span", { className: "text-[10px] text-muted-foreground", children: "No dashboards" })), it.value === 'goals' && (_jsxs("span", { className: "text-[10px] text-muted-foreground", children: [completedGoals, "/250"] })), it.value === 'reports' && (_jsx("span", { className: "text-[10px] text-muted-foreground", children: "No reports" }))] }) }, it.value))) }) }), _jsxs("main", { className: "min-w-0", children: [section === 'dashboards' && (_jsx(DashboardsSection, { usage: usageQ.data })), section === 'goals' && _jsx(GoalsSection, { progress: goalProgress }), section === 'reports' && _jsx(ReportsSection, {})] })] })] }));
}
function DashboardsSection({ usage }) {
    const open = usage?.counts?.deals?.open ?? 0;
    const won = usage?.counts?.deals?.won ?? 0;
    const lost = usage?.counts?.deals?.lost ?? 0;
    const winRate = won + lost === 0 ? 0 : Math.round((won / (won + lost)) * 100);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("section", { className: "rounded-xl border border-border bg-card p-8 text-center shadow-card", children: [_jsx("span", { className: "grid h-14 w-14 mx-auto place-items-center rounded-xl bg-brand-100 text-brand-700", children: _jsx(Sparkles, { className: "h-7 w-7" }) }), _jsx("h2", { className: "mt-4 text-2xl font-extrabold text-foreground", children: "Identify growth opportunities. Take action." }), _jsx("p", { className: "mx-auto mt-2 max-w-md text-sm text-muted-foreground", children: "Set up your personalized, customizable reporting dashboard. Track oxlify data related to your sales activities. Make informed decisions at the right time." }), _jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-3", children: [_jsxs(Button, { children: [_jsx(Plus, { className: "h-4 w-4" }), " Create your first dashboard"] }), _jsx(Button, { variant: "outline", children: "Use a template" })] })] }), _jsxs("section", { children: [_jsx("h3", { className: "mb-3 text-base font-bold text-foreground", children: "Snapshot do funil" }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [_jsx(Kpi, { icon: Trophy, label: "Deals abertos", value: String(open) }), _jsx(Kpi, { icon: TrendingUp, label: "Win rate", value: `${winRate}%`, accent: "success" }), _jsx(Kpi, { icon: Users, label: "Contatos", value: String(usage?.counts?.contacts ?? 0) }), _jsx(Kpi, { icon: Inbox, label: "Leads", value: String(usage?.counts?.leads ?? 0) })] })] })] }));
}
function GoalsSection({ progress }) {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("section", { className: "rounded-xl border border-border bg-card p-8 shadow-card", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-extrabold text-foreground", children: "Goals" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Defina metas pessoais e do time. Acompanhe progresso em tempo real." })] }), _jsxs(Button, { children: [_jsx(Plus, { className: "h-4 w-4" }), " Nova meta"] })] }), _jsxs("div", { className: "mt-5 flex items-center gap-4", children: [_jsx("div", { className: "text-3xl font-extrabold tracking-tight text-brand-700", children: "0/250" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-muted", children: _jsx("div", { className: "h-full rounded-full bg-brand-500", style: { width: `${progress}%` } }) }), _jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: "Metas conclu\u00EDdas neste per\u00EDodo" })] })] })] }), _jsxs("section", { children: [_jsx("h3", { className: "mb-3 text-base font-bold text-foreground", children: "Metas sugeridas" }), _jsx("ul", { className: "grid gap-3 md:grid-cols-2", children: SAMPLE_GOALS.map((g) => (_jsxs("li", { className: "flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-card", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold text-foreground", children: g.label }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [g.current, " / ", g.target] })] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Plus, { className: "h-4 w-4" }), " Adicionar"] })] }, g.label))) })] })] }));
}
function ReportsSection() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("section", { className: "rounded-xl border border-border bg-card p-8 text-center shadow-card", children: [_jsx(FileBarChart, { className: "mx-auto h-12 w-12 text-muted-foreground/50" }), _jsx("h2", { className: "mt-3 text-xl font-extrabold text-foreground", children: "You have no reports yet" }), _jsx("p", { className: "mx-auto mt-2 max-w-md text-sm text-muted-foreground", children: "Build relat\u00F3rios customizados a partir dos seus dados de vendas. Escolha um template abaixo ou comece do zero." }), _jsx("div", { className: "mt-5 flex flex-wrap justify-center gap-2", children: _jsxs(Button, { children: [_jsx(Plus, { className: "h-4 w-4" }), " Create your first report"] }) })] }), _jsxs("section", { children: [_jsx("h3", { className: "mb-3 text-base font-bold text-foreground", children: "Templates populares" }), _jsx("ul", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3", children: REPORT_TEMPLATES.map((t) => (_jsxs("li", { className: "rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-elevated", children: [_jsx("span", { className: "grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600", children: _jsx(t.icon, { className: "h-5 w-5" }) }), _jsx("h4", { className: "mt-3 font-bold text-foreground", children: t.title }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t.desc }), _jsx("button", { type: "button", className: "mt-3 text-xs font-bold text-brand-600 hover:underline", children: "Usar template \u2192" })] }, t.title))) })] })] }));
}
function Kpi({ icon: Icon, label, value, accent = 'brand', }) {
    const colors = {
        brand: 'bg-brand-50 text-brand-600',
        success: 'bg-success/10 text-success',
    };
    return (_jsxs("div", { className: "rounded-xl border border-border bg-card p-5 shadow-card", children: [_jsx("div", { className: cn('grid h-10 w-10 place-items-center rounded-lg', colors[accent]), children: _jsx(Icon, { className: "h-5 w-5" }) }), _jsx("div", { className: "mt-4 text-2xl font-extrabold tracking-tight text-foreground", children: value }), _jsx("div", { className: "text-sm font-medium text-muted-foreground", children: label })] }));
}
