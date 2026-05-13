import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UsersPage } from '@/pages/UsersPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/store/auth.store';

function PrivateRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  if (!accessToken) return <Navigate to="/login" replace />;
  if (role !== 'SUPER_ADMIN') return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PublicOnly() {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (accessToken) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { element: <PublicOnly />, children: [{ path: '/login', element: <LoginPage /> }] },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/organizations', element: <PlaceholderPage title="Organizações" subtitle="Empresas cadastradas." /> },
          { path: '/users', element: <UsersPage /> },
          { path: '/plans', element: <PlaceholderPage title="Planos" /> },
          { path: '/audit', element: <PlaceholderPage title="Trilha de auditoria" /> },
          { path: '/emails', element: <PlaceholderPage title="E-mails enviados" /> },
          { path: '/security', element: <PlaceholderPage title="Segurança" /> },
          { path: '/settings', element: <PlaceholderPage title="Configurações" /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
