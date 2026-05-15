import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { AuthLayout } from '../components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { extractErrorMessage } from '@/lib/api';

export function Verify2faPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const email = (location.state as { email?: string } | null)?.email ?? '';
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!email) navigate('/login');
  }, [email, navigate]);

  const verify = useMutation({
    mutationFn: ({ code }: { code: string }) => authApi.verify2fa(email, code),
    onSuccess: (data) => {
      setSession(data);
      toast.success('Verificado! Vamos configurar sua conta.');
      navigate('/onboarding/personal');
    },
    onError: (err) =>
      toast.error(extractErrorMessage(err, 'Código inválido ou expirado.')),
  });

  const resend = useMutation({
    mutationFn: () => authApi.resend2fa(email),
    onSuccess: () => toast.success('Novo código enviado.'),
    onError: (err) =>
      toast.error(extractErrorMessage(err, 'Não foi possível reenviar.')),
  });

  function onChange(idx: number, v: string) {
    const ch = v.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = ch;
    setDigits(next);
    if (ch && idx < 5) refs.current[idx + 1]?.focus();
  }

  function onKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      e.preventDefault();
      setDigits(text.split(''));
      refs.current[5]?.focus();
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      toast.error('Informe os 6 dígitos.');
      return;
    }
    verify.mutate({ code });
  }

  return (
    <AuthLayout
      title="Verifique seu e-mail"
      subtitle={
        <>
          Enviamos um código de 6 dígitos para <strong>{email}</strong>.
        </>
      }
      footer={
        <Link to="/login" className="text-brand-600 hover:underline">
          Usar outro e-mail
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-6" onPaste={onPaste}>
        <div className="flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={d}
              onChange={(e) => onChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="h-14 w-12 rounded-lg border border-border bg-card text-center text-2xl font-bold text-foreground focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              aria-label={`Dígito ${i + 1}`}
            />
          ))}
        </div>
        <Button type="submit" fullWidth size="lg" loading={verify.isPending}>
          Verificar e continuar
        </Button>
        <button
          type="button"
          onClick={() => resend.mutate()}
          disabled={resend.isPending}
          className="block w-full text-center text-sm text-brand-600 hover:underline disabled:opacity-50"
        >
          {resend.isPending ? 'Enviando...' : 'Reenviar código'}
        </button>
      </form>
    </AuthLayout>
  );
}
