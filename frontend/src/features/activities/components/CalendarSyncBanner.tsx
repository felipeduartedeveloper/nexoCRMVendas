import { useState } from 'react';
import { CalendarClock, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const STORAGE_KEY = 'crmvendas.banner.calendar-sync';

export function CalendarSyncBanner() {
  const [hidden, setHidden] = useState(
    () => typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY) === '1',
  );

  if (hidden) return null;

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, '1');
    setHidden(true);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-warning/30 bg-warning/10 p-4">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-warning text-white">
        <CalendarClock className="h-5 w-5" />
      </span>
      <div className="flex-1 min-w-[280px]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-ink-900">Configure a sincronia de calendário</span>
          <span className="rounded-full bg-ink-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-700">
            Sync inactive
          </span>
        </div>
        <p className="text-sm text-ink-700">
          Sincronize seu Google Calendar ou Outlook para nunca perder um compromisso.
        </p>
      </div>
      <Button size="sm" variant="outline">
        Conectar agora
      </Button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fechar"
        className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-warning/20"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
