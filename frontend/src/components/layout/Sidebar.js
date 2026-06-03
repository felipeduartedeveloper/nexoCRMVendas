import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Users, CalendarCheck, Trophy, Inbox, BarChart3, Mail, MoreHorizontal, Settings, FileText, Megaphone, Package, Tag, Briefcase, Workflow, Shield, CreditCard, ChevronLeft, ChevronRight, HelpCircle, } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/cn';
const primary = [
    { to: '/setup-guide', label: 'Guia de configuração', icon: Compass },
    { to: '/contacts', label: 'Contatos', icon: Users },
    { to: '/activities', label: 'Atividades', icon: CalendarCheck },
    { to: '/deals', label: 'Negócios', icon: Trophy },
    { to: '/leads', label: 'Leads', icon: Inbox },
    { to: '/insights', label: 'Insights', icon: BarChart3 },
    { to: '/sales-inbox', label: 'Caixa de e-mails', icon: Mail },
];
const moreItems = [
    { to: '/products', label: 'Produtos', icon: Package },
    { to: '/projects', label: 'Projetos', icon: Briefcase },
    { to: '/documents', label: 'Documentos', icon: FileText },
    { to: '/marketing/campaigns', label: 'Marketing', icon: Megaphone },
    { to: '/automations', label: 'Automações', icon: Workflow },
    { to: '/labels', label: 'Etiquetas', icon: Tag },
    { to: '/billing', label: 'Plano e cobrança', icon: CreditCard },
    { to: '/permissions', label: 'Permissões', icon: Shield },
    { to: '/help', label: 'Central de ajuda', icon: HelpCircle },
    { to: '/settings', label: 'Configurações', icon: Settings },
];
export function Sidebar({ collapsed, onToggle }) {
    const [moreOpen, setMoreOpen] = useState(false);
    return (_jsxs("aside", { className: cn('sticky top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-all duration-200', collapsed ? 'w-16' : 'w-60'), children: [_jsx("button", { type: "button", onClick: onToggle, "aria-label": collapsed ? 'Expandir menu' : 'Recolher menu', className: "absolute right-0 top-8 z-30 grid h-6 w-6 translate-x-1/2 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-card transition-colors hover:bg-muted hover:text-foreground", children: collapsed ? _jsx(ChevronRight, { className: "h-3.5 w-3.5" }) : _jsx(ChevronLeft, { className: "h-3.5 w-3.5" }) }), _jsx("div", { className: cn('flex h-16 items-center border-b border-border px-3', collapsed ? 'justify-center' : 'justify-start'), children: collapsed ? _jsx(Logo, { withWordmark: false, size: 28 }) : _jsx(Logo, { size: 28 }) }), _jsx("nav", { className: "flex-1 overflow-y-auto p-2", children: _jsxs("ul", { className: "space-y-0.5", children: [primary.map((it) => (_jsx("li", { children: _jsxs(NavLink, { to: it.to, end: it.to === '/setup-guide', className: ({ isActive }) => cn('group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive
                                    ? 'bg-brand-50 text-brand-700'
                                    : 'text-foreground/80 hover:bg-muted hover:text-foreground'), title: collapsed ? it.label : undefined, children: [_jsx(it.icon, { className: "h-5 w-5 flex-shrink-0" }), !collapsed && _jsx("span", { className: "truncate", children: it.label })] }) }, it.to))), _jsx("li", { children: _jsxs("button", { type: "button", onClick: () => setMoreOpen((v) => !v), className: cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', moreOpen
                                    ? 'bg-muted text-foreground'
                                    : 'text-foreground/80 hover:bg-muted hover:text-foreground'), title: collapsed ? 'Mais' : undefined, children: [_jsx(MoreHorizontal, { className: "h-5 w-5" }), !collapsed && _jsx("span", { children: "Mais" })] }) }), moreOpen && (_jsx("ul", { className: cn('mt-1 space-y-0.5', !collapsed && 'border-l border-border pl-3 ml-3'), children: moreItems.map((it) => (_jsx("li", { children: _jsxs(NavLink, { to: it.to, className: ({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive
                                        ? 'bg-brand-50 text-brand-700'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'), title: collapsed ? it.label : undefined, children: [_jsx(it.icon, { className: "h-4 w-4" }), !collapsed && _jsx("span", { className: "truncate", children: it.label })] }) }, it.to))) }))] }) }), !collapsed && (_jsx("div", { className: "border-t border-border p-3", children: _jsxs("div", { className: "rounded-lg bg-brand-50 p-3", children: [_jsx("p", { className: "text-xs font-semibold text-brand-800", children: "14 dias gr\u00E1tis restantes" }), _jsx("p", { className: "mt-1 text-[11px] text-brand-700/80", children: "Fa\u00E7a upgrade para liberar todos os recursos." }), _jsx(NavLink, { to: "/billing", className: "mt-2 inline-block text-xs font-bold text-brand-700 hover:underline", children: "Ver planos \u2192" })] }) }))] }));
}
