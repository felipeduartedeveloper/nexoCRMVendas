import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Activity,
  Mail,
  Shield,
  Settings,
} from 'lucide-react';

import { Logo } from '@/components/Logo';
import { cn } from '@/lib/cn';

const items = [
  { to: '/dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { to: '/organizations', label: 'Organizações', icon: Building2 },
  { to: '/users', label: 'Usuários', icon: Users },
  { to: '/plans', label: 'Planos', icon: CreditCard },
  { to: '/audit', label: 'Trilha de auditoria', icon: Activity },
  { to: '/emails', label: 'E-mails enviados', icon: Mail },
  { to: '/security', label: 'Segurança', icon: Shield },
  { to: '/settings', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-ink-200 bg-white">
      <div className="flex h-16 items-center border-b border-ink-200 px-4">
        <Logo size={28} />
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {items.map((it) => (
            <li key={it.to}>
              <NavLink
                to={it.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-700 hover:bg-ink-100 hover:text-ink-900',
                  )
                }
              >
                <it.icon className="h-5 w-5" />
                <span className="truncate">{it.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-ink-200 p-3 text-xs text-ink-500">
        <div className="font-semibold uppercase tracking-wider text-brand-600">
          SaaS Console
        </div>
        <div>v0.1.0</div>
      </div>
    </aside>
  );
}
