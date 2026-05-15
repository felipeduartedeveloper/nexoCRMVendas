import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Building2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { api, unwrap } from '@/lib/api';

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  organizationId: string;
  jobTitle?: string;
  companyName?: string;
}

export function ContactsPage() {
  const q = useQuery({
    queryKey: ['contacts', 'list'],
    queryFn: async () =>
      unwrap<{ items: Contact[]; total: number }>(
        await api.get('/contacts', { params: { page: 1, limit: 50 } }),
      ),
  });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Contatos"
        subtitle="Pessoas com quem você está construindo relacionamento."
        actions={
          <Button>
            <Plus className="h-4 w-4" /> Novo contato
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="relative flex w-full max-w-sm items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground/70" />
            <input
              placeholder="Buscar por nome, e-mail…"
              className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" /> Filtros
          </Button>
        </div>

        {q.isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner label="Carregando contatos…" />
          </div>
        ) : !q.data?.items?.length ? (
          <div className="grid place-items-center p-12 text-center text-sm text-muted-foreground">
            Nenhum contato ainda.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/40 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Empresa</th>
              </tr>
            </thead>
            <tbody>
              {q.data.items.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/50 hover:bg-brand-50/40"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        {c.name
                          .split(' ')
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </span>
                      <span className="font-semibold text-foreground">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground/80">{c.email ?? '—'}</td>
                  <td className="px-4 py-3 text-foreground/80">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3">
                    {c.companyName ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/80">
                        <Building2 className="h-3 w-3" /> {c.companyName}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
