import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const STORAGE_KEY = 'crmvendas.banner.pipelines-ready';

export function PipelinesReadyBanner() {
  const [hidden, setHidden] = useState(() =>
    typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY) === '1',
  );

  if (hidden) return null;

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, '1');
    setHidden(true);
  }

  return (
    <div className="mb-4 flex items-center gap-4 rounded-xl border border-brand-200 bg-brand-50 p-4">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-500 text-white">
        <Sparkles className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <div className="font-bold text-foreground">Seus pipelines estão prontos!</div>
        <p className="text-sm text-foreground/80">
          Criamos um pipeline com estágios sugeridos para o seu setor. Você pode
          ajustar os estágios a qualquer momento para refletir seu processo comercial.
        </p>
      </div>
      <Button size="sm" onClick={dismiss}>
        Got it
      </Button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fechar"
        className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-brand-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
