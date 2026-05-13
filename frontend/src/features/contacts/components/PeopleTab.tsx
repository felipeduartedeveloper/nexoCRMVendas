import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Building2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { contactsApi } from '@/api/contacts.api';
import { initials } from '@/lib/format';
import { NewContactModal } from './NewContactModal';

export function PeopleTab() {
  const [search, setSearch] = useState('');
  const [openNew, setOpenNew] = useState(false);

  const q = useQuery({
    queryKey: ['contacts', { search }],
    queryFn: () => contactsApi.list({ search: search || undefined, limit: 200 }),
  });

  const items = q.data?.items ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b border-ink-200 p-3">
        <div className="relative flex w-full max-w-sm items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pessoas…"
            className="h-9 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" /> Filtros
        </Button>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-medium text-ink-500">
            {q.data?.total ?? 0} pessoas
          </span>
          <Button onClick={() => setOpenNew(true)}>
            <Plus className="h-4 w-4" /> Nova pessoa
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50 text-left text-[11px] font-bold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-2.5">Nome</th>
              <th className="px-4 py-2.5">E-mail</th>
              <th className="px-4 py-2.5">Telefone</th>
              <th className="px-4 py-2.5">Cargo</th>
              <th className="px-4 py-2.5">Empresa</th>
              <th className="px-4 py-2.5">Labels</th>
              <th className="px-4 py-2.5">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {q.isLoading ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-ink-500">
                  Carregando contatos…
                </td>
              </tr>
            ) : !items.length ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-sm text-ink-500">
                  Nenhum contato ainda.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="border-b border-ink-100 hover:bg-brand-50/40">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
                        {initials(c.name)}
                      </span>
                      <span className="font-semibold text-ink-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-700">{c.email ?? '—'}</td>
                  <td className="px-4 py-2.5 text-ink-700">{c.phone ?? '—'}</td>
                  <td className="px-4 py-2.5 text-ink-700">{c.jobTitle ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    {c.orgCompanyId ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-700">
                        <Building2 className="h-3 w-3" /> Empresa
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {c.labels?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {c.labels.slice(0, 3).map((l) => (
                          <span
                            key={l}
                            className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] text-brand-700"
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">
                    {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <NewContactModal open={openNew} onClose={() => setOpenNew(false)} />
    </div>
  );
}
