import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { Verify2faPage } from '@/features/auth/pages/Verify2faPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { useIsAuthenticated } from '@/store/auth.store';

function PrivateRoute() {
  const isAuth = useIsAuthenticated();
  if (!isAuth) return <Navigate to="/login" replace />;
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
      // Onboarding e app vão aqui — adicionados nos próximos passos.
      { path: '/dashboard', element: <DashboardPlaceholder /> },
      { path: '/onboarding/personal', element: <OnboardingPlaceholder /> },
      { path: '/onboarding/company', element: <OnboardingPlaceholder /> },
      { path: '/onboarding/setup-tour', element: <OnboardingPlaceholder /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

function DashboardPlaceholder() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-50">
      <div className="rounded-xl border border-ink-200 bg-white p-8 text-center shadow-card">
        <h1 className="text-2xl font-bold text-ink-900">Dashboard</h1>
        <p className="mt-2 text-sm text-ink-600">App shell virá no próximo sprint.</p>
      </div>
    </div>
  );
}

function OnboardingPlaceholder() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-50">
      <div className="rounded-xl border border-ink-200 bg-white p-8 text-center shadow-card">
        <h1 className="text-2xl font-bold text-ink-900">Onboarding</h1>
        <p className="mt-2 text-sm text-ink-600">Wizard será adicionado em seguida.</p>
      </div>
    </div>
  );
}
