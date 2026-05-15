import type { ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  User,
  Lock,
  Mail,
  Users as UsersIcon,
  Calendar,
  HardDrive,
  Smartphone,
  Bell,
  Gift,
  Sliders,
  Building2,
  Settings as SettingsIcon,
  UserCog,
  UserCheck,
  Database,
  Activity,
  Beaker,
  CreditCard,
  Shield,
  LayoutDashboard,
  AlertTriangle,
  Workflow,
  KeyRound,
  Webhook as WebhookIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface NavItem {
  to: string;
  label: string;
  icon: any;
}

const myAccount: NavItem[] = [
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

const companyOverview: NavItem[] = [
  { to: '/settings/company-overview', label: 'Company overview', icon: Building2 },
];

const companySettings: NavItem[] = [
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

function Section({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div className="mb-6">
      <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-ink-500">
        {title}
      </div>
      <ul className="space-y-0.5">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-brand-50 font-semibold text-brand-700'
                    : 'text-ink-700 hover:bg-ink-100',
                )
              }
            >
              <it.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{it.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SettingsLayout() {
  const location = useLocation();
  const pageTitle =
    [...myAccount, ...companyOverview, ...companySettings].find(
      (i) => i.to === location.pathname || location.pathname.startsWith(i.to + '/'),
    )?.label ?? 'Settings';

  return (
    <div className="-m-6 flex min-h-[calc(100vh-64px)]">
      <aside className="w-64 shrink-0 border-r border-ink-200 bg-white">
        <div className="border-b border-ink-200 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-ink-500">
            Settings
          </div>
          <div className="mt-0.5 text-base font-extrabold text-ink-900">{pageTitle}</div>
        </div>
        <div className="p-3">
          <Section title="My account" items={myAccount} />
          <Section title="Company overview" items={companyOverview} />
          <Section title="Company settings" items={companySettings} />
        </div>
      </aside>
      <div className="min-w-0 flex-1 bg-ink-50 p-6 lg:p-8">
        <SettingsBreadcrumbs pageTitle={pageTitle} />
        <Outlet />
      </div>
    </div>
  );
}

function SettingsBreadcrumbs({ pageTitle }: { pageTitle: string }) {
  return (
    <div className="mb-4 text-sm text-ink-500">
      Settings <span className="mx-1">/</span>
      <span className="font-semibold text-ink-900">{pageTitle}</span>
    </div>
  );
}

export function SettingsPlaceholder({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-600">{description}</p>}
      </header>
      {children ?? (
        <div className="grid place-items-center rounded-xl border border-dashed border-ink-300 bg-white p-12 text-center">
          <p className="max-w-md text-sm text-ink-500">
            Esta seção será implementada nos próximos sprints. Toda a estrutura de navegação,
            integração com backend e permissões já está em vigor.
          </p>
        </div>
      )}
    </div>
  );
}
