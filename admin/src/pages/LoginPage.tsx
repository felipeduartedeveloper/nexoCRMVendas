import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Mail, Lock, Shield, ShieldCheck, KeyRound } from 'lucide-react';

import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Turnstile } from '@/components/Turnstile';
import { api, extractErrorMessage, unwrap } from '@/lib/api';
import { useAuthStore, type AdminUser } from '@/store/auth.store';

interface LoginResp {
  requires2fa?: boolean;
  status?: 'TOTP_REQUIRED' | 'TOTP_SETUP_REQUIRED';
  totpToken?: string;
  user?: AdminUser;
  accessToken?: string;
  refreshToken?: string;
}

type Step = 'login' | 'setup' | 'totp';

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [code, setCode] = useState('');

  const [totpToken, setTotpToken] = useState('');
  const [qr, setQr] = useState('');
  const [secret, setSecret] = useState('');

  const onCaptcha = useCallback((t: string) => setCaptcha(t), []);

  function finishSession(resp: LoginResp) {
    if (resp.user?.role !== 'SUPER_ADMIN') {
      toast.error('Acesso restrito ao console SaaS.');
      return;
    }
    if (resp.accessToken && resp.refreshToken) {
      setSession({ user: resp.user, accessToken: resp.accessToken, refreshToken: resp.refreshToken });
      navigate('/dashboard');
    }
  }

  // passo 1: e-mail + senha (+ captcha)
  const loginM = useMutation({
    mutationFn: async () =>
      unwrap<LoginResp>(await api.post('/auth/login', { email, password, captchaToken: captcha })),
    onSuccess: async (resp) => {
      if (resp.status === 'TOTP_REQUIRED' && resp.totpToken) {
        setTotpToken(resp.totpToken);
        setStep('totp');
        return;
      }
      if (resp.status === 'TOTP_SETUP_REQUIRED' && resp.totpToken) {
        setTotpToken(resp.totpToken);
        try {
          const s = unwrap<{ qrDataUrl: string; secret: string }>(
            await api.post('/auth/totp/setup', { token: resp.totpToken }),
          );
          setQr(s.qrDataUrl);
          setSecret(s.secret);
          setStep('setup');
        } catch (err) {
          toast.error(extractErrorMessage(err, 'Falha ao gerar o QR de 2FA.'));
        }
        return;
      }
      // fallback (não esperado p/ SUPER_ADMIN, mas trata)
      finishSession(resp);
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Falha no login.')),
  });

  // passo 2: confirma o código e ATIVA o 2FA
  const enableM = useMutation({
    mutationFn: async () =>
      unwrap<LoginResp>(await api.post('/auth/totp/enable', { token: totpToken, code })),
    onSuccess: finishSession,
    onError: (err) => toast.error(extractErrorMessage(err, 'Código inválido.')),
  });

  // passo 3 (2FA já ativo): verifica o código
  const verifyM = useMutation({
    mutationFn: async () =>
      unwrap<LoginResp>(await api.post('/auth/totp/verify', { token: totpToken, code })),
    onSuccess: finishSession,
    onError: (err) => toast.error(extractErrorMessage(err, 'Código inválido.')),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step === 'login') return loginM.mutate();
    if (step === 'setup') return enableM.mutate();
    return verifyM.mutate();
  }

  const busy = loginM.isPending || enableM.isPending || verifyM.isPending;

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
          <h1 className="text-center text-3xl font-extrabold tracking-tight text-ink-900">SaaS Console</h1>
          <p className="mt-2 text-center text-sm text-ink-600">
            Painel administrativo do oxlify. Acesso somente para SUPER_ADMIN, com 2FA obrigatório.
          </p>
          <div className="mt-8 rounded-xl border border-ink-200 bg-white p-7 shadow-card">
            <form onSubmit={onSubmit} className="space-y-4">
              {step === 'login' && (
                <>
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
                  <Turnstile onToken={onCaptcha} />
                  <Button type="submit" fullWidth size="lg" loading={busy}>
                    Entrar no console
                  </Button>
                </>
              )}

              {step === 'setup' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                    <ShieldCheck className="h-4 w-4 text-brand-600" /> Configure o 2FA para continuar
                  </div>
                  <p className="text-xs text-ink-600">
                    Escaneie o QR no Google Authenticator (ou Authy, 1Password…) e digite o código de 6
                    dígitos para ativar.
                  </p>
                  {qr && (
                    <img
                      src={qr}
                      alt="QR Code 2FA"
                      width={184}
                      height={184}
                      className="mx-auto rounded-lg border border-ink-200 bg-white p-2"
                    />
                  )}
                  {secret && (
                    <p className="break-all text-center font-mono text-[11px] text-ink-500">
                      chave manual: {secret}
                    </p>
                  )}
                  <Input
                    label="Código do autenticador"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="text-center font-mono text-lg tracking-[0.4em]"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    leftSlot={<KeyRound className="h-4 w-4" />}
                    required
                  />
                  <Button type="submit" fullWidth size="lg" loading={busy}>
                    Ativar e entrar
                  </Button>
                </div>
              )}

              {step === 'totp' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                    <ShieldCheck className="h-4 w-4 text-brand-600" /> Verificação em duas etapas
                  </div>
                  <p className="text-xs text-ink-600">
                    Digite o código de 6 dígitos do seu aplicativo autenticador.
                  </p>
                  <Input
                    label="Código do autenticador"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="text-center font-mono text-lg tracking-[0.4em]"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    leftSlot={<KeyRound className="h-4 w-4" />}
                    required
                    autoFocus
                  />
                  <Button type="submit" fullWidth size="lg" loading={busy}>
                    Verificar e entrar
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
