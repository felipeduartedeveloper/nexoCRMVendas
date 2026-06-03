import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
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
import { ProductsPage } from '@/features/products/pages/ProductsPage';
import { ProjectsBoardPage } from '@/features/projects/pages/ProjectsBoardPage';
import { MarketingLayout } from '@/features/marketing/components/MarketingLayout';
import { CampaignsListPage } from '@/features/marketing/pages/CampaignsListPage';
import { TemplatesPage } from '@/features/marketing/pages/TemplatesPage';
import { AudiencesPage } from '@/features/marketing/pages/AudiencesPage';
import { RecommendationsPage } from '@/features/marketing/pages/RecommendationsPage';
import { MarketingSettingsPage } from '@/features/marketing/pages/MarketingSettingsPage';
import { SettingsLayout, SettingsPlaceholder, } from '@/features/settings/components/SettingsLayout';
import { GeneralPage } from '@/features/settings/pages/GeneralPage';
import { ManageUsersPage } from '@/features/settings/pages/ManageUsersPage';
import { DataFieldsPage } from '@/features/settings/pages/DataFieldsPage';
import { UsagePage } from '@/features/settings/pages/UsagePage';
import { BillingPage } from '@/features/settings/pages/BillingPage';
import { SecurityCenterPage } from '@/features/settings/pages/SecurityCenterPage';
import { WebhooksPage } from '@/features/settings/pages/WebhooksPage';
import { useAuthStore, useIsAuthenticated } from '@/store/auth.store';
function PrivateRoute() {
    const isAuth = useIsAuthenticated();
    if (!isAuth)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(Outlet, {});
}
function AppOnlyRoute() {
    const isAuth = useIsAuthenticated();
    const orgId = useAuthStore((s) => s.user?.organizationId);
    if (!isAuth)
        return _jsx(Navigate, { to: "/login", replace: true });
    if (!orgId)
        return _jsx(Navigate, { to: "/onboarding/personal", replace: true });
    return _jsx(Outlet, {});
}
function PublicOnlyRoute() {
    const isAuth = useIsAuthenticated();
    if (isAuth)
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    return _jsx(Outlet, {});
}
function RootRedirect() {
    const isAuth = useIsAuthenticated();
    return _jsx(Navigate, { to: isAuth ? '/dashboard' : '/login', replace: true });
}
export const router = createBrowserRouter([
    { path: '/', element: _jsx(RootRedirect, {}) },
    {
        element: _jsx(PublicOnlyRoute, {}),
        children: [
            { path: '/login', element: _jsx(LoginPage, {}) },
            { path: '/register', element: _jsx(RegisterPage, {}) },
            { path: '/verify-2fa', element: _jsx(Verify2faPage, {}) },
            { path: '/forgot-password', element: _jsx(ForgotPasswordPage, {}) },
            { path: '/reset-password', element: _jsx(ResetPasswordPage, {}) },
        ],
    },
    {
        element: _jsx(PrivateRoute, {}),
        children: [
            { path: '/onboarding/personal', element: _jsx(PersonalInfoPage, {}) },
            { path: '/onboarding/company', element: _jsx(CompanyInfoPage, {}) },
            { path: '/onboarding/setup-tour', element: _jsx(SetupTourPage, {}) },
        ],
    },
    {
        element: _jsx(AppOnlyRoute, {}),
        children: [
            {
                element: _jsx(AppShell, {}),
                children: [
                    { path: '/dashboard', element: _jsx(DashboardPage, {}) },
                    { path: '/setup-guide', element: _jsx(SetupGuidePage, {}) },
                    { path: '/contacts', element: _jsx(ContactsPage, {}) },
                    { path: '/activities', element: _jsx(ActivitiesPage, {}) },
                    { path: '/deals', element: _jsx(DealsPage, {}) },
                    { path: '/leads', element: _jsx(LeadsPage, {}) },
                    { path: '/insights', element: _jsx(InsightsPage, {}) },
                    { path: '/sales-inbox', element: _jsx(SalesInboxPage, {}) },
                    // Settings (SettingsLayout aninhado)
                    {
                        path: '/settings',
                        element: _jsx(SettingsLayout, {}),
                        children: [
                            { index: true, element: _jsx(Navigate, { to: "/settings/company", replace: true }) },
                            { path: 'company', element: _jsx(GeneralPage, {}) },
                            {
                                path: 'personal',
                                element: (_jsx(SettingsPlaceholder, { title: "Personal preferences", description: "Defina seu idioma, fuso hor\u00E1rio e formato de data." })),
                            },
                            {
                                path: 'password',
                                element: (_jsx(SettingsPlaceholder, { title: "Password and login", description: "Altere sua senha, gerencie 2FA e sess\u00F5es ativas." })),
                            },
                            {
                                path: 'email-sync',
                                element: (_jsx(SettingsPlaceholder, { title: "Email sync", description: "Sincronize Gmail/Outlook two-way." })),
                            },
                            {
                                path: 'contact-sync',
                                element: _jsx(SettingsPlaceholder, { title: "Contact sync" }),
                            },
                            {
                                path: 'calendar-sync',
                                element: _jsx(SettingsPlaceholder, { title: "Calendar sync" }),
                            },
                            {
                                path: 'drive',
                                element: _jsx(SettingsPlaceholder, { title: "Google Drive" }),
                            },
                            {
                                path: 'devices',
                                element: _jsx(SettingsPlaceholder, { title: "Your devices" }),
                            },
                            {
                                path: 'notifications',
                                element: _jsx(SettingsPlaceholder, { title: "Notifications" }),
                            },
                            {
                                path: 'referral',
                                element: _jsx(SettingsPlaceholder, { title: "Referral program" }),
                            },
                            {
                                path: 'interface',
                                element: _jsx(SettingsPlaceholder, { title: "Interface preferences" }),
                            },
                            {
                                path: 'company-overview',
                                element: (_jsx(SettingsPlaceholder, { title: "Company overview", description: "Vis\u00E3o consolidada da empresa, planos e m\u00E9tricas." })),
                            },
                            { path: 'users', element: _jsx(ManageUsersPage, {}) },
                            { path: 'user-overview', element: _jsx(SettingsPlaceholder, { title: "User overview" }) },
                            { path: 'data-fields', element: _jsx(DataFieldsPage, {}) },
                            { path: 'usage', element: _jsx(UsagePage, {}) },
                            { path: 'beta', element: _jsx(SettingsPlaceholder, { title: "Beta program" }) },
                            { path: 'billing', element: _jsx(BillingPage, {}) },
                            { path: 'security', element: _jsx(SecurityCenterPage, {}) },
                            { path: 'webhooks', element: _jsx(WebhooksPage, {}) },
                            { path: 'dashboard', element: _jsx(SettingsPlaceholder, { title: "Dashboard" }) },
                            { path: 'alerts', element: _jsx(SettingsPlaceholder, { title: "Alerts" }) },
                            { path: 'rules', element: _jsx(SettingsPlaceholder, { title: "Rules" }) },
                            { path: 'sso', element: _jsx(SettingsPlaceholder, { title: "Single sign-on" }) },
                        ],
                    },
                    {
                        path: '/profile',
                        element: (_jsx(PlaceholderPage, { title: "Meu perfil", subtitle: "Suas informa\u00E7\u00F5es e prefer\u00EAncias." })),
                    },
                    { path: '/products', element: _jsx(ProductsPage, {}) },
                    { path: '/projects', element: _jsx(ProjectsBoardPage, {}) },
                    { path: '/projects/board', element: _jsx(ProjectsBoardPage, {}) },
                    { path: '/documents', element: _jsx(PlaceholderPage, { title: "Documentos" }) },
                    { path: '/campaigns', element: _jsx(Navigate, { to: "/marketing/campaigns", replace: true }) },
                    {
                        path: '/marketing',
                        element: _jsx(MarketingLayout, {}),
                        children: [
                            { index: true, element: _jsx(Navigate, { to: "/marketing/campaigns", replace: true }) },
                            { path: 'campaigns', element: _jsx(CampaignsListPage, {}) },
                            { path: 'templates', element: _jsx(TemplatesPage, {}) },
                            { path: 'audiences', element: _jsx(AudiencesPage, {}) },
                            { path: 'recommendations', element: _jsx(RecommendationsPage, {}) },
                            { path: 'settings', element: _jsx(MarketingSettingsPage, {}) },
                        ],
                    },
                    { path: '/automations', element: _jsx(PlaceholderPage, { title: "Automa\u00E7\u00F5es" }) },
                    { path: '/labels', element: _jsx(PlaceholderPage, { title: "Etiquetas" }) },
                    { path: '/billing', element: _jsx(Navigate, { to: "/settings/billing", replace: true }) },
                    { path: '/permissions', element: _jsx(PlaceholderPage, { title: "Permiss\u00F5es" }) },
                    { path: '/help', element: _jsx(PlaceholderPage, { title: "Central de ajuda" }) },
                    { path: '/integrations', element: _jsx(PlaceholderPage, { title: "Integra\u00E7\u00F5es" }) },
                ],
            },
        ],
    },
    { path: '*', element: _jsx(NotFoundPage, {}) },
]);
