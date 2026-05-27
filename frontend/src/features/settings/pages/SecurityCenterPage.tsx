import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Smartphone, Lock, AlertTriangle, History, ShieldCheck, KeyRound } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi, type TotpSecret } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { extractErrorMessage } from '@/lib/api';

const otherItems = [
  {
    icon: Smartphone,
    title: 'Sessões ativas',
    desc: 'Lista de dispositivos com sessão ativa.',
    note: 'Em breve.',
  },
  {
    icon: AlertTriangle,
    title: 'Alertas de login suspeito',
    desc: 'Notificações ao detectar acesso de novos IPs/dispositivos.',
    note: 'Em breve.',
  },
  {
    icon: History,
    title: 'Trilha de auditoria',
    desc: 'Histórico imutável de mudanças críticas em deals/users.',
    note: 'Disponível no Power+',
  },
];

function TwoFactorCard() {
  const setUser = useAuthStore((s) => s.setUser);
  const storeUser = useAuthStore((s) => s.user);

  const [enabled, setEnabled] = useState<boolean>(!!storeUser?.totpEnabled);
  const [mode, setMode] = useState<'idle' | 'setup' | 'disable'>('idle');
  const [secret, setSecret] = useState<TotpSecret | null>(null);
  const [code, setCode] = useState('');

  // fonte de verdade: /auth/me (totpEnabled real)
  const meQ = useQuery({ queryKey: ['auth', 'me'], queryFn: authApi.me });
  useEffect(() => {
    if (meQ.data) {
      setEnabled(!!meQ.data.totpEnabled);
      if (storeUser) setUser({ ...storeUser, ...meQ.data });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meQ.data]);

  function reset() {
    setMode('idle');
    setSecret(null);
    setCode('');
  }

  const initM = useMutation({
    mutationFn: authApi.totpInit,
    onSuccess: (data) => {
      setSecret(data);
      setMode('setup');
      setCode('');
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Não foi possível iniciar o 2FA.')),
  });

  const confirmM = useMutation({
    mutationFn: () => authApi.totpConfirm(code),
    onSuccess: () => {
      setEnabled(true);
      if (storeUser) setUser({ ...storeUser, totpEnabled: true });
      reset();
      toast.success('2FA ativado com sucesso!');
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Código inválido.')),
  });

  const disableM = useMutation({
    mutationFn: () => authApi.totpDisable(code),
    onSuccess: () => {
      setEnabled(false);
      if (storeUser) setUser({ ...storeUser, totpEnabled: false });
      reset();
      toast.success('2FA desativado.');
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Código inválido.')),
  });

  return (
    <li className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start gap-4">
        <span
          className={
            'grid h-10 w-10 shrink-0 place-items-center rounded-lg ' +
            (enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')
          }
        >
          <Lock className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground">Autenticação em duas etapas (2FA)</h3>
            <span
              className={
                'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ' +
                (enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')
              }
            >
              {enabled ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Use o Google Authenticator, Authy ou 1Password para gerar códigos de 6 dígitos no login.
          </p>
        </div>
        {mode === 'idle' && (
          <>
            {enabled ? (
              <Button variant="outline" size="sm" onClick={() => setMode('disable')}>
                Desativar
              </Button>
            ) : (
              <Button size="sm" loading={initM.isPending} onClick={() => initM.mutate()}>
                <ShieldCheck className="h-4 w-4" /> Ativar 2FA
              </Button>
            )}
          </>
        )}
      </div>

      {mode === 'setup' && secret && (
        <div className="mt-5 space-y-4 rounded-lg border border-border bg-muted/30 p-5">
          <p className="text-sm text-muted-foreground">
            1. Escaneie o QR no app autenticador. 2. Digite o código de 6 dígitos para confirmar.
          </p>
          <img
            src={secret.qrDataUrl}
            alt="QR Code 2FA"
            width={184}
            height={184}
            className="mx-auto rounded-lg border border-border bg-white p-2"
          />
          <p className="break-all text-center font-mono text-[11px] text-muted-foreground">
            chave manual: {secret.secret}
          </p>
          <Input
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="text-center font-mono text-lg tracking-[0.4em]"
            leftSlot={<KeyRound className="h-4 w-4" />}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <div className="flex gap-2">
            <Button
              fullWidth
              loading={confirmM.isPending}
              disabled={code.length !== 6}
              onClick={() => confirmM.mutate()}
            >
              Confirmar e ativar
            </Button>
            <Button variant="outline" onClick={reset}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {mode === 'disable' && (
        <div className="mt-5 space-y-4 rounded-lg border border-border bg-muted/30 p-5">
          <p className="text-sm text-muted-foreground">
            Digite um código atual do autenticador para confirmar a desativação.
          </p>
          <Input
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="text-center font-mono text-lg tracking-[0.4em]"
            leftSlot={<KeyRound className="h-4 w-4" />}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <div className="flex gap-2">
            <Button
              variant="danger"
              fullWidth
              loading={disableM.isPending}
              disabled={code.length !== 6}
              onClick={() => disableM.mutate()}
            >
              Desativar 2FA
            </Button>
            <Button variant="outline" onClick={reset}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

export function SecurityCenterPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Security center</h1>
        <p className="mt-1 text-sm text-muted-foreground">Controles de segurança da sua conta.</p>
      </header>

      <ul className="space-y-3">
        <TwoFactorCard />
        {otherItems.map((it) => (
          <li
            key={it.title}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-card"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
              <it.icon className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground">{it.title}</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                  {it.note}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
