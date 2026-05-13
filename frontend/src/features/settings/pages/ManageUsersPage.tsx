import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Mail, Shield, UserMinus, UserCheck } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { usersApi, type AppUser } from '@/api/settings.api';
import { extractErrorMessage } from '@/lib/api';
import { initials } from '@/lib/format';
import { cn } from '@/lib/cn';

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES', 'VIEWER'] as const;

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: 'bg-brand-100 text-brand-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  MANAGER: 'bg-purple-100 text-purple-700',
  SALES: 'bg-green-100 text-green-700',
  VIEWER: 'bg-ink-100 text-ink-700',
};

export function ManageUsersPage() {
  const qc = useQueryClient();
  const [openInvite, setOpenInvite] = useState(false);

  const q = useQuery({
    queryKey: ['settings-users'],
    queryFn: () => usersApi.list({ limit: 200 }),
  });

  const setRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      usersApi.update(id, { role: role as any }),
    onSuccess: async () => {
      toast.success('Papel atualizado.');
      await qc.invalidateQueries({ queryKey: ['settings-users'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const toggleActive = useMutation({
    mutationFn: (u: AppUser) =>
      u.isActive ? usersApi.deactivate(u.id) : usersApi.activate(u.id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['settings-users'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const users = q.data?.items ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Manage users</h1>
          <p className="mt-1 text-sm text-ink-600">
            {q.data?.total ?? 0} usuários · convide vendedores, gerentes e administradores.
          </p>
        </div>
        <Button onClick={() => setOpenInvite(true)}>
          <Plus className="h-4 w-4" /> Convidar usuário
        </Button>
      </header>

      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50 text-left text-[11px] font-bold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-2.5">Nome</th>
              <th className="px-4 py-2.5">E-mail</th>
              <th className="px-4 py-2.5">Papel</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Último login</th>
              <th className="px-4 py-2.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {q.isLoading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-ink-500">
                  Carregando…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-sm text-ink-500">
                  Nenhum usuário ainda.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-ink-100 hover:bg-brand-50/30">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        {initials(u.name)}
                      </span>
                      <span className="font-semibold text-ink-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-700">{u.email}</td>
                  <td className="px-4 py-2.5">
                    <select
                      value={u.role}
                      onChange={(e) => setRole.mutate({ id: u.id, role: e.target.value })}
                      className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide focus:outline-none',
                        ROLE_BADGE[u.role] ?? 'bg-ink-100 text-ink-700',
                      )}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                        u.isActive ? 'bg-success/10 text-success' : 'bg-ink-100 text-ink-500',
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          u.isActive ? 'bg-success' : 'bg-ink-400',
                        )}
                      />
                      {u.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleString('pt-BR')
                      : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => toggleActive.mutate(u)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-ink-600 hover:text-ink-900"
                    >
                      {u.isActive ? (
                        <>
                          <UserMinus className="h-3.5 w-3.5" /> Desativar
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3.5 w-3.5" /> Reativar
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {openInvite && <InviteUserModal onClose={() => setOpenInvite(false)} />}
    </div>
  );
}

function InviteUserModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('SALES');
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const m = useMutation({
    mutationFn: () => usersApi.invite({ email, name, role }),
    onSuccess: async (resp) => {
      setTempPassword(resp.tempPassword);
      await qc.invalidateQueries({ queryKey: ['settings-users'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !name) return toast.error('Preencha nome e e-mail.');
    m.mutate();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-elevated">
        <div className="mb-4">
          <div className="inline-flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-600" />
            <h3 className="text-lg font-bold text-ink-900">Convidar novo usuário</h3>
          </div>
          <p className="mt-1 text-sm text-ink-600">
            O usuário receberá uma senha temporária para o primeiro acesso.
          </p>
        </div>

        {tempPassword ? (
          <div className="rounded-lg border border-success/30 bg-success/10 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-success">
              <Mail className="h-4 w-4" /> Convite criado!
            </div>
            <p className="mt-2 text-sm text-ink-700">
              Envie estas credenciais para <strong>{email}</strong>:
            </p>
            <div className="mt-3 rounded-lg bg-white p-3 font-mono text-sm">
              <div>E-mail: {email}</div>
              <div>Senha temporária: <strong>{tempPassword}</strong></div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={onClose}>Fechar</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div>
              <span className="field-label">Papel</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm"
              >
                <option value="ADMIN">ADMIN — controla tudo da empresa</option>
                <option value="MANAGER">MANAGER — gerencia time e relatórios</option>
                <option value="SALES">SALES — vendedor</option>
                <option value="VIEWER">VIEWER — somente leitura</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={onClose} disabled={m.isPending}>
                Cancelar
              </Button>
              <Button type="submit" loading={m.isPending}>
                Enviar convite
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
