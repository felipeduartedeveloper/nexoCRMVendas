import { useQuery } from '@tanstack/react-query';
import { Clock, User } from 'lucide-react';
import { contactsApi } from '@/api/contacts.api';
import { initials } from '@/lib/format';

function groupByDate(items: { id: string; name: string; email: string | null; updatedAt: string }[]) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const groups: Record<string, typeof items> = {};
  items.forEach((c) => {
    const d = new Date(c.updatedAt);
    let key: string;
    const diffDays = Math.floor((startOfToday.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000);
    if (diffDays <= 0) key = 'Hoje';
    else if (diffDays === 1) key = 'Ontem';
    else if (diffDays <= 7) key = 'Esta semana';
    else if (diffDays <= 30) key = 'Este mês';
    else key = 'Anterior';
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });
  return groups;
}

export function TimelineTab() {
  const q = useQuery({
    queryKey: ['contacts-timeline'],
    queryFn: contactsApi.timeline,
  });

  if (q.isLoading) {
    return <div className="p-12 text-center text-sm text-muted-foreground">Carregando timeline…</div>;
  }
  const items = q.data ?? [];
  if (!items.length) {
    return (
      <div className="p-12 text-center text-sm text-muted-foreground">
        Sua timeline está vazia. Atualizações em contatos aparecerão aqui.
      </div>
    );
  }
  const grouped = groupByDate(items);

  return (
    <div className="p-5">
      {Object.entries(grouped).map(([label, list]) => (
        <div key={label} className="mb-6 last:mb-0">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {label}
          </div>
          <ul className="space-y-2">
            {list.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {initials(c.name)}
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.email ?? 'Sem e-mail'}</div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.updatedAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <User className="h-4 w-4 text-muted-foreground/50" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
