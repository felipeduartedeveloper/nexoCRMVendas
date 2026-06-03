import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { User, Lock, Mail, Users as UsersIcon, Calendar, HardDrive, Smartphone, Bell, Gift, Sliders, Building2, Settings as SettingsIcon, UserCog, UserCheck, Database, Activity, Beaker, CreditCard, Shield, LayoutDashboard, AlertTriangle, Workflow, KeyRound, Webhook as WebhookIcon, } from 'lucide-react';
import { cn } from '@/lib/cn';
const myAccount = [
    { to: '/settings/personal', label: 'Personal preferences', icon: User },
    { to: '/settings/password', label: 'Password and login', icon: Lock },
    { to: '/settings/email-sync', label: 'Email sync', icon: Mail },
    { to: '/settings/contact-sync', label: 'Contact sync', icon: UsersIcon },
    { to: '/settings/calendar-sync', label: 'Calendar sync', icon: Calendar },
    { to: '/settings/drive', label: 'Google Drive', icon: HardDrive },
    { to: '/settings/devices', label: 'Your devices', icon: Smartphone },
    { to: '/settings/notifications', label: 'Notifications', icon: Bell },
    { to: '/settings/referral', label: 'Referral program', icon: Gift },
    { to: '/settings/interface', label: 'Interface preferences', icon: Sliders },
];
const companyOverview = [
    { to: '/settings/company-overview', label: 'Company overview', icon: Building2 },
];
const companySettings = [
    { to: '/settings/company', label: 'Company settings', icon: SettingsIcon },
    { to: '/settings/users', label: 'Manage users', icon: UserCog },
    { to: '/settings/user-overview', label: 'User overview', icon: UserCheck },
    { to: '/settings/data-fields', label: 'Data fields', icon: Database },
    { to: '/settings/usage', label: 'Usage', icon: Activity },
    { to: '/settings/beta', label: 'Beta program', icon: Beaker },
    { to: '/settings/billing', label: 'Billing', icon: CreditCard },
    { to: '/settings/security', label: 'Security center', icon: Shield },
    { to: '/settings/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/settings/alerts', label: 'Alerts', icon: AlertTriangle },
    { to: '/settings/rules', label: 'Rules', icon: Workflow },
    { to: '/settings/sso', label: 'Single sign-on', icon: KeyRound },
    { to: '/settings/webhooks', label: 'Webhooks', icon: WebhookIcon },
];
function Section({ title, items }) {
    return (_jsxs("div", { className: "mb-6", children: [_jsx("div", { className: "mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground", children: title }), _jsx("ul", { className: "space-y-0.5", children: items.map((it) => (_jsx("li", { children: _jsxs(NavLink, { to: it.to, className: ({ isActive }) => cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors', isActive
                            ? 'bg-brand-50 font-semibold text-brand-700'
                            : 'text-foreground/80 hover:bg-muted'), children: [_jsx(it.icon, { className: "h-4 w-4 shrink-0" }), _jsx("span", { className: "truncate", children: it.label })] }) }, it.to))) })] }));
}
export function SettingsLayout() {
    const location = useLocation();
    const pageTitle = [...myAccount, ...companyOverview, ...companySettings].find((i) => i.to === location.pathname || location.pathname.startsWith(i.to + '/'))?.label ?? 'Settings';
    return (_jsxs("div", { className: "-m-6 flex min-h-[calc(100vh-64px)]", children: [_jsxs("aside", { className: "w-64 shrink-0 border-r border-border bg-card", children: [_jsxs("div", { className: "border-b border-border p-4", children: [_jsx("div", { className: "text-xs font-bold uppercase tracking-wide text-muted-foreground", children: "Settings" }), _jsx("div", { className: "mt-0.5 text-base font-extrabold text-foreground", children: pageTitle })] }), _jsxs("div", { className: "p-3", children: [_jsx(Section, { title: "My account", items: myAccount }), _jsx(Section, { title: "Company overview", items: companyOverview }), _jsx(Section, { title: "Company settings", items: companySettings })] })] }), _jsxs("div", { className: "min-w-0 flex-1 bg-muted/40 p-6 lg:p-8", children: [_jsx(SettingsBreadcrumbs, { pageTitle: pageTitle }), _jsx(Outlet, {})] })] }));
}
function SettingsBreadcrumbs({ pageTitle }) {
    return (_jsxs("div", { className: "mb-4 text-sm text-muted-foreground", children: ["Settings ", _jsx("span", { className: "mx-1", children: "/" }), _jsx("span", { className: "font-semibold text-foreground", children: pageTitle })] }));
}
export function SettingsPlaceholder({ title, description, children, }) {
    return (_jsxs("div", { className: "mx-auto max-w-4xl", children: [_jsxs("header", { className: "mb-6", children: [_jsx("h1", { className: "text-2xl font-extrabold tracking-tight text-foreground", children: title }), description && _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: description })] }), children ?? (_jsx("div", { className: "grid place-items-center rounded-xl border border-dashed border-border bg-card p-12 text-center", children: _jsx("p", { className: "max-w-md text-sm text-muted-foreground", children: "Esta se\u00E7\u00E3o ser\u00E1 implementada nos pr\u00F3ximos sprints. Toda a estrutura de navega\u00E7\u00E3o, integra\u00E7\u00E3o com backend e permiss\u00F5es j\u00E1 est\u00E1 em vigor." }) }))] }));
}
