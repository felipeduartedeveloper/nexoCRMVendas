import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';

import { AuthLayout } from '../components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { extractErrorMessage } from '@/lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const m = useMutation({
    mutationFn: authApi.login,
    onSuccess: (resp) => {
      if (resp.requires2fa) {
        toast('Enviamos um código para o seu e-mail.');
        navigate('/verify-2fa', { state: { email } });
        return;
      }
      if (resp.user && resp.accessToken && resp.refreshToken) {
        setSession({
          user: resp.user,
          accessToken: resp.accessToken,
          refreshToken: resp.refreshToken,
        });
        toast.success('Bem-vindo de volta!');
        navigate('/dashboard');
      }
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Falha no login.')),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Informe e-mail e senha.');
      return;
    }
    m.mutate({ email, password });
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse sua conta para gerenciar seu funil de vendas."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:underline">
            Criar conta grátis
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          leftSlot={<Mail className="h-4 w-4" aria-hidden />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          leftSlot={<Lock className="h-4 w-4" aria-hidden />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>
        <Button type="submit" fullWidth size="lg" loading={m.isPending}>
          Entrar
        </Button>
      </form>
    </AuthLayout>
  );
}
