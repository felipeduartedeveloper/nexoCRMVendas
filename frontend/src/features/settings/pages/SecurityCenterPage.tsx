import { Shield, Smartphone, Lock, AlertTriangle, History } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const items = [
  {
    icon: Lock,
    title: 'Two-factor authentication (2FA)',
    desc: 'Códigos por e-mail são exigidos no primeiro login após registro.',
    enabled: true,
  },
  {
    icon: Smartphone,
    title: 'Sessões ativas',
    desc: 'Lista de dispositivos com sessão ativa.',
    enabled: false,
    note: 'Em breve.',
  },
  {
    icon: AlertTriangle,
    title: 'Alertas de login suspeito',
    desc: 'Notificações ao detectar acesso de novos IPs/dispositivos.',
    enabled: false,
    note: 'Em breve.',
  },
  {
    icon: History,
    title: 'Trilha de auditoria',
    desc: 'Histórico imutável de mudanças críticas em deals/users.',
    enabled: false,
    note: 'Disponível no Power+',
  },
];

export function SecurityCenterPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Security center
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Controles de segurança da sua organização.
        </p>
      </header>

      <ul className="space-y-3">
        {items.map((it) => (
          <li
            key={it.title}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-card"
          >
            <span
              className={
                'grid h-10 w-10 shrink-0 place-items-center rounded-lg ' +
                (it.enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')
              }
            >
              <it.icon className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground">{it.title}</h3>
                {it.enabled ? (
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase text-success">
                    Ativo
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                    {it.note ?? 'Inativo'}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
            </div>
            <Button variant="outline" size="sm" disabled={!it.enabled}>
              <Shield className="h-4 w-4" /> Gerir
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
