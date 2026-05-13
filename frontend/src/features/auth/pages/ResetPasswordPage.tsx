import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';

import { AuthLayout } from '../components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/api/auth.api';
import { extractErrorMessage } from '@/lib/api';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const m = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
    onSuccess: () => {
      toast.success('Senha redefinida. Faça login novamente.');
      navigate('/login');
    },
    onError: (err) =>
      toast.error(extractErrorMessage(err, 'Link inválido ou expirado.')),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      toast.error('Token de recuperação ausente.');
      return;
    }
    if (password.length < 8) {
      toast.error('A senha precisa ter ao menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      toast.error('As senhas não coincidem.');
      return;
    }
    m.mutate({ token, password });
  }

  return (
    <AuthLayout
      title="Defina uma nova senha"
      subtitle="Escolha uma senha forte que você não use em outros sites."
      footer={
        <Link to="/login" className="text-brand-600 hover:underline">
          Voltar para o login
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Nova senha"
          type="password"
          placeholder="Mínimo 8 caracteres"
          leftSlot={<Lock className="h-4 w-4" aria-hidden />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Confirmar senha"
          type="password"
          placeholder="Repita a senha"
          leftSlot={<Lock className="h-4 w-4" aria-hidden />}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <Button type="submit" fullWidth size="lg" loading={m.isPending}>
          Salvar nova senha
        </Button>
      </form>
    </AuthLayout>
  );
}
