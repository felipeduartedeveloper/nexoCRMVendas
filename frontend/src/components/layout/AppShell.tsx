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
    return <Navigate to={BILLING_PATH} replace />;
  }

  return (
    <div className="flex min-h-screen bg-muted/40 dark:bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-x-hidden p-6">
          <Outlet />
        </main>
      </div>
      <TrialEndingModal />
    </div>
  );
}
