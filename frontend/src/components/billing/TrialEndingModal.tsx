import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, X } from 'lucide-react';
import { useOrgAccess } from '@/hooks/useOrgAccess';

const SESSION_KEY = 'trial-popup-shown';

/** Popup uma vez por sessão quando faltam ≤5 dias de trial → leva para o billing. */
export function TrialEndingModal() {
  const nav = useNavigate();
  const { isTrial, daysLeft } = useOrgAccess();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isTrial && daysLeft <= 5 && !sessionStorage.getItem(SESSION_KEY)) {
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, '1');
    }
  }, [isTrial, daysLeft]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-black/50 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-7 text-center shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/15 text-brand-600">
          <Clock className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-extrabold text-foreground">
          Seu teste expira em {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Assine um plano para não perder o acesso aos seus dados e ao funil de vendas.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Depois
          </button>
          <button
            onClick={() => { setOpen(false); nav('/settings/billing'); }}
            className="flex-1 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Ver planos
          </button>
        </div>
      </div>
    </div>
  );
}
