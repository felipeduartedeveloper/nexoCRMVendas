import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

import { AuthLayout } from '../components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/api/auth.api';
import { extractErrorMessage } from '@/lib/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const m = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Conta criada! Enviamos um código para o seu e-mail.');
      navigate('/verify-2fa', { state: { email, fromRegister: true } });
    },
    onError: (err) =>
      toast.error(extractErrorMessage(err, 'Não foi possível criar a conta.')),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('A senha precisa ter ao menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      toast.error('As senhas não conferem.');
      return;
    }
    m.mutate({ name, email, password });
  }

  return (
    <AuthLayout
      title="Comece grátis"
      subtitle="15 dias de teste. Sem cartão de crédito."
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Nome completo"
          autoComplete="name"
          placeholder="Maria Silva"
          leftSlot={<User className="h-4 w-4" aria-hidden />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="E-mail profissional"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          leftSlot={<Mail className="h-4 w-4" aria-hidden />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Digite sua senha"
          type={showPwd ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          leftSlot={<Lock className="h-4 w-4" aria-hidden />}
          rightSlot={
            <button type="button" onClick={() => setShowPwd((v) => !v)}
              className="hover:text-foreground" aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}>
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="Use ao menos 8 caracteres, com letras e números."
          required
        />
        <Input
          label="Confirme sua senha"
          type={showConfirm ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repita a senha"
          leftSlot={<Lock className="h-4 w-4" aria-hidden />}
          rightSlot={
            <button type="button" onClick={() => setShowConfirm((v) => !v)}
              className="hover:text-foreground" aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}>
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={confirm.length > 0 && confirm !== password ? 'As senhas não conferem.' : undefined}
          required
        />
        <Button type="submit" fullWidth size="lg" loading={m.isPending}>
          Criar minha conta
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Ao criar a conta você concorda com nossos{' '}
          <a href="#" className="text-brand-600 hover:underline">
            Termos
          </a>{' '}
          e a{' '}
          <a href="#" className="text-brand-600 hover:underline">
            Política de Privacidade
          </a>
          .
        </p>
      </form>
    </AuthLayout>
  );
}
