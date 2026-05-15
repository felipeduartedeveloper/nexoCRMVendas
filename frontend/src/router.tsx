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
import { ContactsPage } from '@/features/contacts/pages/ContactsPage';
import { PlaceholderPage } from '@/features/app/pages/PlaceholderPage';
import { DealsPage } from '@/features/deals/pages/DealsPage';
import { ActivitiesPage } from '@/features/activities/pages/ActivitiesPage';
import { SalesInboxPage } from '@/features/sales-inbox/pages/SalesInboxPage';
import { LeadsPage } from '@/features/leads/pages/LeadsPage';
import { InsightsPage } from '@/features/insights/pages/InsightsPage';

import {
  SettingsLayout,
  SettingsPlaceholder,
} from '@/features/settings/components/SettingsLayout';
import { GeneralPage } from '@/features/settings/pages/GeneralPage';
import { ManageUsersPage } from '@/features/settings/pages/ManageUsersPage';
import { DataFieldsPage } from '@/features/settings/pages/DataFieldsPage';
import { UsagePage } from '@/features/settings/pages/UsagePage';
import { BillingPage } from '@/features/settings/pages/BillingPage';
import { SecurityCenterPage } from '@/features/settings/pages/SecurityCenterPage';

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
          { path: '/activities', element: <ActivitiesPage /> },
          { path: '/deals', element: <DealsPage /> },
          { path: '/leads', element: <LeadsPage /> },
          { path: '/insights', element: <InsightsPage /> },
          { path: '/sales-inbox', element: <SalesInboxPage /> },

          // Settings (SettingsLayout aninhado)
          {
            path: '/settings',
            element: <SettingsLayout />,
            children: [
              { index: true, element: <Navigate to="/settings/company" replace /> },
              { path: 'company', element: <GeneralPage /> },
              {
                path: 'personal',
                element: (
                  <SettingsPlaceholder
                    title="Personal preferences"
                    description="Defina seu idioma, fuso horário e formato de data."
                  />
                ),
              },
              {
                path: 'password',
                element: (
                  <SettingsPlaceholder
                    title="Password and login"
                    description="Altere sua senha, gerencie 2FA e sessões ativas."
                  />
                ),
              },
              {
                path: 'email-sync',
                element: (
                  <SettingsPlaceholder
                    title="Email sync"
                    description="Sincronize Gmail/Outlook two-way."
                  />
                ),
              },
              {
                path: 'contact-sync',
                element: <SettingsPlaceholder title="Contact sync" />,
              },
              {
                path: 'calendar-sync',
                element: <SettingsPlaceholder title="Calendar sync" />,
              },
              {
                path: 'drive',
                element: <SettingsPlaceholder title="Google Drive" />,
              },
              {
                path: 'devices',
                element: <SettingsPlaceholder title="Your devices" />,
              },
              {
                path: 'notifications',
                element: <SettingsPlaceholder title="Notifications" />,
              },
              {
                path: 'referral',
                element: <SettingsPlaceholder title="Referral program" />,
              },
              {
                path: 'interface',
                element: <SettingsPlaceholder title="Interface preferences" />,
              },
              {
                path: 'company-overview',
                element: (
                  <SettingsPlaceholder
                    title="Company overview"
                    description="Visão consolidada da empresa, planos e métricas."
                  />
                ),
              },
              { path: 'users', element: <ManageUsersPage /> },
              { path: 'user-overview', element: <SettingsPlaceholder title="User overview" /> },
              { path: 'data-fields', element: <DataFieldsPage /> },
              { path: 'usage', element: <UsagePage /> },
              { path: 'beta', element: <SettingsPlaceholder title="Beta program" /> },
              { path: 'billing', element: <BillingPage /> },
              { path: 'security', element: <SecurityCenterPage /> },
              { path: 'dashboard', element: <SettingsPlaceholder title="Dashboard" /> },
              { path: 'alerts', element: <SettingsPlaceholder title="Alerts" /> },
              { path: 'rules', element: <SettingsPlaceholder title="Rules" /> },
              { path: 'sso', element: <SettingsPlaceholder title="Single sign-on" /> },
            ],
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
