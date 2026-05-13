import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Building2, Globe, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { companiesApi } from '@/api/contacts.api';
import { initials } from '@/lib/format';
import { NewCompanyModal } from './NewCompanyModal';

export function OrganizationsTab() {
  const [search, setSearch] = useState('');
  const [openNew, setOpenNew] = useState(false);

  const q = useQuery({
    queryKey: ['companies', { search }],
    queryFn: () => companiesApi.list({ search: search || undefined, limit: 200 }),
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
            placeholder="Buscar empresas…"
            className="h-9 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" /> Filtros
        </Button>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-medium text-ink-500">
            {q.data?.total ?? 0} empresas
          </span>
          <Button onClick={() => setOpenNew(true)}>
            <Plus className="h-4 w-4" /> Nova empresa
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50 text-left text-[11px] font-bold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-2.5">Empresa</th>
              <th className="px-4 py-2.5">Setor</th>
              <th className="px-4 py-2.5">Site</th>
              <th className="px-4 py-2.5">Telefone</th>
              <th className="px-4 py-2.5">País</th>
              <th className="px-4 py-2.5">Criada em</th>
            </tr>
          </thead>
          <tbody>
            {q.isLoading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-ink-500">
                  Carregando empresas…
                </td>
              </tr>
            ) : !items.length ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-sm text-ink-500">
                  Nenhuma empresa cadastrada.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="border-b border-ink-100 hover:bg-brand-50/40">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-100 text-[11px] font-bold text-brand-700">
                        {initials(c.name)}
                      </span>
                      <span className="font-semibold text-ink-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-700">{c.industry ?? '—'}</td>
                  <td className="px-4 py-2.5 text-ink-700">
                    {c.website ? (
                      <a
                        href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                      >
                        <Globe className="h-3 w-3" /> {c.website}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-ink-700">{c.phone ?? '—'}</td>
                  <td className="px-4 py-2.5 text-ink-700">
                    {c.country ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-ink-400" /> {c.country}
                      </span>
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

      <NewCompanyModal open={openNew} onClose={() => setOpenNew(false)} />
    </div>
  );
}
