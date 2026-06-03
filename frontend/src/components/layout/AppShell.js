import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { TrialEndingModal } from '@/components/billing/TrialEndingModal';
import { useOrgAccess } from '@/hooks/useOrgAccess';
const BILLING_PATH = '/settings/billing';
export function AppShell() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const { isBlocked, isLoading } = useOrgAccess();
    // Paywall (UX): trial expirado/sem plano → só a página de billing abre. A regra
    // real é server-side (402). Evita redirecionar antes de carregar o status.
    if (!isLoading && isBlocked && location.pathname !== BILLING_PATH) {
        return _jsx(Navigate, { to: BILLING_PATH, replace: true });
    }
    return (_jsxs("div", { className: "flex min-h-screen bg-muted/40 dark:bg-background", children: [_jsx(Sidebar, { collapsed: collapsed, onToggle: () => setCollapsed((v) => !v) }), _jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [_jsx(Topbar, {}), _jsx("main", { className: "flex-1 overflow-x-hidden p-6", children: _jsx(Outlet, {}) })] }), _jsx(TrialEndingModal, {})] }));
}
