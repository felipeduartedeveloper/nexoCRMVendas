import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { api, unwrap } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string | null;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

const roleBadgeColor: Record<string, string> = {
  SUPER_ADMIN: 'bg-brand-100 text-brand-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  MANAGER: 'bg-purple-100 text-purple-700',
  SALES: 'bg-green-100 text-green-700',
  VIEWER: 'bg-ink-100 text-ink-700',
};

export function UsersPage() {
  const q = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () =>
      unwrap<{ items: User[]; total: number }>(
        await api.get('/users', { params: { page: 1, limit: 100 } }),
      ),
  });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Usuários</h1>
          <p className="mt-1 text-sm text-ink-600">
            Todos os usuários cadastrados na plataforma.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" /> Convidar SUPER_ADMIN
        </Button>
      </div>

      <div className="rounded-xl border border-ink-200 bg-white shadow-card">
        <div className="flex items-center gap-3 border-b border-ink-200 p-4">
          <div className="relative flex w-full max-w-sm items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink-400" />
            <input
              placeholder="Buscar por nome ou e-mail…"
              className="h-9 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <span className="text-xs font-medium text-ink-500">
            {q.data?.total ?? 0} usuários
          </span>
        </div>

        {q.isLoading ? (
          <div className="p-12 text-center text-sm text-ink-500">Carregando…</div>
        ) : !q.data?.items?.length ? (
          <div className="p-12 text-center text-sm text-ink-500">
            Nenhum usuário ainda.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Papel</th>
                <th className="px-4 py-3">Organização</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {q.data.items.map((u) => (
                <tr key={u.id} className="border-b border-ink-100 hover:bg-ink-50">
                  <td className="px-4 py-3 font-semibold text-ink-900">{u.name}</td>
                  <td className="px-4 py-3 text-ink-700">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        'rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ' +
                        (roleBadgeColor[u.role] ?? 'bg-ink-100 text-ink-700')
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {u.organizationId ? (
                      <span className="font-mono text-xs">
                        {u.organizationId.slice(0, 8)}…
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ' +
                        (u.isActive
                          ? 'bg-success/10 text-success'
                          : 'bg-ink-100 text-ink-500')
                      }
                    >
                      <span
                        className={
                          'h-1.5 w-1.5 rounded-full ' +
                          (u.isActive ? 'bg-success' : 'bg-ink-400')
                        }
                      />
                      {u.isActive ? 'Ativo' : 'Inativo'}
                    </span>
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
