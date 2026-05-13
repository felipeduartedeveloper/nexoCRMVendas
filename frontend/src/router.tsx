import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { Verify2faPage } from '@/features/auth/pages/Verify2faPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { PersonalInfoPage } from '@/features/onboarding/pages/PersonalInfoPage';
import { CompanyInfoPage } from '@/features/onboarding/pages/CompanyInfoPage';
import { SetupTourPage } from '@/features/onboarding/pages/SetupTourPage';

import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { SetupGuidePage } from '@/features/app/pages/SetupGuidePage';
import { ContactsPage } from '@/features/app/pages/ContactsPage';
import { PlaceholderPage } from '@/features/app/pages/PlaceholderPage';

import { useAuthStore, useIsAuthenticated } from '@/store/auth.store';

function PrivateRoute() {
  const isAuth = useIsAuthenticated();
  if (!isAuth) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AppOnlyRoute() {
  const isAuth = useIsAuthenticated();
  const orgId = useAuthStore((s) => s.user?.organizationId);
  if (!isAuth) return <Navigate to="/login" replace />;
  if (!orgId) return <Navigate to="/onboarding/personal" replace />;
  return <Outlet />;
}

function PublicOnlyRoute() {
  const isAuth = useIsAuthenticated();
  if (isAuth) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/verify-2fa', element: <Verify2faPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      { path: '/onboarding/personal', element: <PersonalInfoPage /> },
      { path: '/onboarding/company', element: <CompanyInfoPage /> },
      { path: '/onboarding/setup-tour', element: <SetupTourPage /> },
    ],
  },
  {
    element: <AppOnlyRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/setup-guide', element: <SetupGuidePage /> },
          { path: '/contacts', element: <ContactsPage /> },
          {
            path: '/activities',
            element: (
              <PlaceholderPage title="Atividades" subtitle="Ligações, reuniões, tarefas e prazos." />
            ),
          },
          {
            path: '/deals',
            element: (
              <PlaceholderPage title="Negócios" subtitle="Kanban de deals por etapa." />
            ),
          },
          {
            path: '/leads',
            element: (
              <PlaceholderPage title="Leads" subtitle="Caixa de entrada de leads ainda não qualificados." />
            ),
          },
          {
            path: '/insights',
            element: (
              <PlaceholderPage title="Insights" subtitle="Relatórios e dashboards de performance." />
            ),
          },
          {
            path: '/sales-inbox',
            element: (
              <PlaceholderPage title="Caixa de e-mails" subtitle="Sincronize Gmail/Outlook com os deals." />
            ),
          },
          {
            path: '/settings',
            element: (
              <PlaceholderPage title="Configurações" subtitle="Empresa, usuários, integrações e pipelines." />
            ),
          },
          {
            path: '/profile',
            element: (
              <PlaceholderPage title="Meu perfil" subtitle="Suas informações e preferências." />
            ),
          },
          { path: '/products', element: <PlaceholderPage title="Produtos" /> },
          { path: '/projects', element: <PlaceholderPage title="Projetos" /> },
          { path: '/documents', element: <PlaceholderPage title="Documentos" /> },
          { path: '/campaigns', element: <PlaceholderPage title="Campanhas" /> },
          { path: '/automations', element: <PlaceholderPage title="Automações" /> },
          { path: '/labels', element: <PlaceholderPage title="Etiquetas" /> },
          { path: '/billing', element: <PlaceholderPage title="Plano e cobrança" /> },
          { path: '/permissions', element: <PlaceholderPage title="Permissões" /> },
          { path: '/help', element: <PlaceholderPage title="Central de ajuda" /> },
          { path: '/integrations', element: <PlaceholderPage title="Integrações" /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
