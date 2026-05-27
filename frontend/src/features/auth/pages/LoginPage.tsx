import { useCallback, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Mail, Lock, KeyRound, ShieldCheck } from 'lucide-react';

import { AuthLayout } from '../components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Turnstile, type TurnstileHandle } from '@/components/Turnstile';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { extractErrorMessage } from '@/lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');

  const [totpStep, setTotpStep] = useState(false);
  const [totpToken, setTotpToken] = useState('');
  const [code, setCode] = useState('');
  const turnstileRef = useRef<TurnstileHandle>(null);

  const onCaptcha = useCallback((t: string) => setCaptcha(t), []);

  const m = useMutation({
    mutationFn: () => authApi.login({ email, password, captchaToken: captcha }),
    onSuccess: (resp) => {
      if (resp.requires2fa) {
        toast('Enviamos um código para o seu e-mail.');
        navigate('/verify-2fa', { state: { email } });
        return;
      }
      if (resp.status === 'TOTP_REQUIRED' && resp.totpToken) {
        setTotpToken(resp.totpToken);
        setTotpStep(true);
        return;
      }
      if (resp.user && resp.accessToken && resp.refreshToken) {
        setSession({ user: resp.user, accessToken: resp.accessToken, refreshToken: resp.refreshToken });
        toast.success('Bem-vindo de volta!');
        navigate('/dashboard');
      }
    },
    onError: (err) => {
      // token Turnstile é de uso único — gera um novo pra próxima tentativa
      turnstileRef.current?.reset();
      toast.error(extractErrorMessage(err, 'Falha no login.'));
    },
  });

  const totpM = useMutation({
    mutationFn: () => authApi.totpVerifyLogin(totpToken, code),
    onSuccess: (resp) => {
      setSession({ user: resp.user, accessToken: resp.accessToken, refreshToken: resp.refreshToken });
      toast.success('Bem-vindo de volta!');
      navigate('/dashboard');
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Código inválido.')),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (totpStep) {
      if (code.length !== 6) return toast.error('Digite o código de 6 dígitos.');
      return totpM.mutate();
    }
    if (!email || !password) {
      toast.error('Informe e-mail e senha.');
      return;
    }
    m.mutate();
  }

  return (
    <AuthLayout
      title={totpStep ? 'Verificação em duas etapas' : 'Entrar'}
      subtitle={
        totpStep
          ? 'Digite o código do seu aplicativo autenticador.'
          : 'Acesse sua conta para gerenciar seu funil de vendas.'
      }
      footer={
        totpStep ? (
          <button
            type="button"
            onClick={() => {
              setTotpStep(false);
              setCode('');
            }}
            className="font-semibold text-brand-600 hover:underline"
          >
            Voltar ao login
          </button>
        ) : (
          <>
            Ainda não tem conta?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline">
              Criar conta grátis
            </Link>
          </>
        )
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {totpStep ? (
          <>
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-brand-600" /> Código do autenticador
            </div>
            <Input
              label="Código de 6 dígitos"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              placeholder="000000"
              className="text-center font-mono text-lg tracking-[0.4em]"
              leftSlot={<KeyRound className="h-4 w-4" aria-hidden />}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
            <Button type="submit" fullWidth size="lg" loading={totpM.isPending}>
              Verificar e entrar
            </Button>
          </>
        ) : (
          <>
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
              <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:underline">
                Esqueci minha senha
              </Link>
            </div>
            <Turnstile ref={turnstileRef} onToken={onCaptcha} />
            <Button type="submit" fullWidth size="lg" loading={m.isPending}>
              Entrar
            </Button>
          </>
        )}
      </form>
    </AuthLayout>
  );
}
