import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Mail, Megaphone, Sparkles, Users2 } from 'lucide-react';
const sections = [
    {
        title: 'Campanhas',
        items: [
            { to: '/marketing/campaigns', label: 'Todas', icon: Megaphone, end: false },
        ],
    },
    {
        title: 'Conteúdo',
        items: [
            { to: '/marketing/templates', label: 'Modelos', icon: Mail, end: false },
            { to: '/marketing/audiences', label: 'Audiências', icon: Users2, end: false },
        ],
    },
    {
        title: 'IA',
        items: [
            {
                to: '/marketing/recommendations',
                label: 'Recomendações',
                icon: Sparkles,
                end: false,
            },
        ],
    },
    {
        title: 'Configuração',
        items: [
            { to: '/marketing/settings', label: 'Domínio e envio', icon: BarChart3, end: false },
        ],
    },
];
export function MarketingLayout() {
    return (_jsxs("div", { className: "grid h-full grid-cols-[240px_1fr]", children: [_jsxs("aside", { className: "border-r border-border bg-card p-4", children: [_jsx("h2", { className: "mb-3 px-2 text-lg font-bold text-foreground", children: "Marketing" }), _jsx("nav", { className: "space-y-4", children: sections.map((s) => (_jsxs("div", { children: [_jsx("h3", { className: "mb-1 px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: s.title }), _jsx("ul", { className: "space-y-0.5", children: s.items.map((it) => (_jsx("li", { children: _jsxs(NavLink, { to: it.to, end: it.end, className: ({ isActive }) => `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${isActive
                                                ? 'bg-brand-50 text-brand-700'
                                                : 'text-foreground/80 hover:bg-muted'}`, children: [_jsx(it.icon, { className: "h-4 w-4" }), it.label] }) }, it.to))) })] }, s.title))) })] }), _jsx("main", { className: "overflow-auto", children: _jsx(Outlet, {}) })] }));
}
