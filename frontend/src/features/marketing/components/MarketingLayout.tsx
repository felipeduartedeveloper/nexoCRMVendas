import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Mail, Megaphone, Sparkles, Users2 } from 'lucide-react';

const sections = [
  {
    title: 'Campanhas',
    items: [
      { to: '/marketing/campaigns', label: 'Todas', icon: Megaphone, end: false },
    ],
  },
  {
    title: 'Conteúdo',
    items: [
      { to: '/marketing/templates', label: 'Modelos', icon: Mail, end: false },
      { to: '/marketing/audiences', label: 'Audiências', icon: Users2, end: false },
    ],
  },
  {
    title: 'IA',
    items: [
      {
        to: '/marketing/recommendations',
        label: 'Recomendações',
        icon: Sparkles,
        end: false,
      },
    ],
  },
  {
    title: 'Configuração',
    items: [
      { to: '/marketing/settings', label: 'Domínio e envio', icon: BarChart3, end: false },
    ],
  },
];

export function MarketingLayout() {
  return (
    <div className="grid h-full grid-cols-[240px_1fr]">
      <aside className="border-r border-ink-200 bg-white p-4">
        <h2 className="mb-3 px-2 text-lg font-bold text-ink-900">Marketing</h2>
        <nav className="space-y-4">
          {sections.map((s) => (
            <div key={s.title}>
              <h3 className="mb-1 px-2 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                {s.title}
              </h3>
              <ul className="space-y-0.5">
                {s.items.map((it) => (
                  <li key={it.to}>
                    <NavLink
                      to={it.to}
                      end={it.end}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-ink-700 hover:bg-ink-100'
                        }`
                      }
                    >
                      <it.icon className="h-4 w-4" />
                      {it.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <main className="overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
