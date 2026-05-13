import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Mail, Lock, Shield } from 'lucide-react';

import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, extractErrorMessage, unwrap } from '@/lib/api';
import { useAuthStore, type AdminUser } from '@/store/auth.store';

interface LoginResp {
  requires2fa?: boolean;
  user?: AdminUser;
  accessToken?: string;
  refreshToken?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('admin@crmvendas.local');
  const [password, setPassword] = useState('');

  const m = useMutation({
    mutationFn: async (payload: { email: string; password: string }) =>
      unwrap<LoginResp>(await api.post('/auth/login', payload)),
    onSuccess: (resp) => {
      if (resp.requires2fa) {
        toast('Verifique seu e-mail para confirmar o acesso.');
        return;
      }
      if (resp.user?.role !== 'SUPER_ADMIN') {
        toast.error('Acesso restrito ao console SaaS.');
        return;
      }
      if (resp.accessToken && resp.refreshToken) {
        setSession({
          user: resp.user,
          accessToken: resp.accessToken,
          refreshToken: resp.refreshToken,
        });
        navigate('/dashboard');
      }
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Falha no login.')),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    m.mutate({ email, password });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-ink-50">
      <header className="container-wide flex items-center justify-between py-6">
        <Logo />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
          <Shield className="h-3.5 w-3.5" /> Acesso restrito
        </span>
      </header>
      <main className="container-wide grid place-items-center py-12">
        <div className="w-full max-w-md">
          <h1 className="text-center text-3xl font-extrabold tracking-tight text-ink-900">
            SaaS Console
          </h1>
          <p className="mt-2 text-center text-sm text-ink-600">
            Painel administrativo do CRM Vendas. Acesso somente para SUPER_ADMIN.
          </p>
          <div className="mt-8 rounded-xl border border-ink-200 bg-white p-7 shadow-card">
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftSlot={<Mail className="h-4 w-4" />}
                required
              />
              <Input
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftSlot={<Lock className="h-4 w-4" />}
                required
              />
              <Button type="submit" fullWidth size="lg" loading={m.isPending}>
                Entrar no console
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
