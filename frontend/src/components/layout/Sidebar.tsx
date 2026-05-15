import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  Users,
  CalendarCheck,
  Trophy,
  Inbox,
  BarChart3,
  Mail,
  MoreHorizontal,
  Settings,
  FileText,
  Megaphone,
  Package,
  Tag,
  Briefcase,
  Workflow,
  Shield,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

import { Logo } from '@/components/Logo';
import { cn } from '@/lib/cn';

const primary = [
  { to: '/setup-guide', label: 'Guia de configuração', icon: Compass },
  { to: '/contacts', label: 'Contatos', icon: Users },
  { to: '/activities', label: 'Atividades', icon: CalendarCheck },
  { to: '/deals', label: 'Negócios', icon: Trophy },
  { to: '/leads', label: 'Leads', icon: Inbox },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/sales-inbox', label: 'Caixa de e-mails', icon: Mail },
];

const moreItems = [
  { to: '/products', label: 'Produtos', icon: Package },
  { to: '/projects', label: 'Projetos', icon: Briefcase },
  { to: '/documents', label: 'Documentos', icon: FileText },
  { to: '/marketing/campaigns', label: 'Marketing', icon: Megaphone },
  { to: '/automations', label: 'Automações', icon: Workflow },
  { to: '/labels', label: 'Etiquetas', icon: Tag },
  { to: '/billing', label: 'Plano e cobrança', icon: CreditCard },
  { to: '/permissions', label: 'Permissões', icon: Shield },
  { to: '/help', label: 'Central de ajuda', icon: HelpCircle },
  { to: '/settings', label: 'Configurações', icon: Settings },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: Props) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-col border-r border-border bg-card transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        className="absolute right-0 top-8 z-30 grid h-6 w-6 translate-x-1/2 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-card transition-colors hover:bg-muted hover:text-foreground"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      <div
        className={cn(
          'flex h-16 items-center border-b border-border px-3',
          collapsed ? 'justify-center' : 'justify-start',
        )}
      >
        {collapsed ? <Logo withWordmark={false} size={28} /> : <Logo size={28} />}
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {primary.map((it) => (
            <li key={it.to}>
              <NavLink
                to={it.to}
                end={it.to === '/setup-guide'}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-700 hover:bg-ink-100 hover:text-ink-900',
                  )
                }
                title={collapsed ? it.label : undefined}
              >
                <it.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="truncate">{it.label}</span>}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                moreOpen
                  ? 'bg-ink-100 text-ink-900'
                  : 'text-ink-700 hover:bg-ink-100 hover:text-ink-900',
              )}
              title={collapsed ? 'Mais' : undefined}
            >
              <MoreHorizontal className="h-5 w-5" />
              {!collapsed && <span>Mais</span>}
            </button>
          </li>
          {moreOpen && (
            <ul className={cn('mt-1 space-y-0.5', !collapsed && 'border-l border-ink-200 pl-3 ml-3')}>
              {moreItems.map((it) => (
                <li key={it.to}>
                  <NavLink
                    to={it.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
                      )
                    }
                    title={collapsed ? it.label : undefined}
                  >
                    <it.icon className="h-4 w-4" />
                    {!collapsed && <span className="truncate">{it.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </ul>
      </nav>

      {!collapsed && (
        <div className="border-t border-ink-200 p-3">
          <div className="rounded-lg bg-brand-50 p-3">
            <p className="text-xs font-semibold text-brand-800">
              14 dias grátis restantes
            </p>
            <p className="mt-1 text-[11px] text-brand-700/80">
              Faça upgrade para liberar todos os recursos.
            </p>
            <NavLink
              to="/billing"
              className="mt-2 inline-block text-xs font-bold text-brand-700 hover:underline"
            >
              Ver planos →
            </NavLink>
          </div>
        </div>
      )}
    </aside>
  );
}
