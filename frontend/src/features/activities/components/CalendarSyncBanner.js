import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { CalendarClock, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
const STORAGE_KEY = 'crmvendas.banner.calendar-sync';
export function CalendarSyncBanner() {
    const [hidden, setHidden] = useState(() => typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY) === '1');
    if (hidden)
        return null;
    function dismiss() {
        window.localStorage.setItem(STORAGE_KEY, '1');
        setHidden(true);
    }
    return (_jsxs("div", { className: "mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-warning/30 bg-warning/10 p-4", children: [_jsx("span", { className: "grid h-10 w-10 place-items-center rounded-lg bg-warning text-white", children: _jsx(CalendarClock, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex-1 min-w-[280px]", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-bold text-foreground", children: "Configure a sincronia de calend\u00E1rio" }), _jsx("span", { className: "rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground/80", children: "Sync inactive" })] }), _jsx("p", { className: "text-sm text-foreground/80", children: "Sincronize seu Google Calendar ou Outlook para nunca perder um compromisso." })] }), _jsx(Button, { size: "sm", variant: "outline", children: "Conectar agora" }), _jsx("button", { type: "button", onClick: dismiss, "aria-label": "Fechar", className: "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-warning/20", children: _jsx(X, { className: "h-4 w-4" }) })] }));
}
