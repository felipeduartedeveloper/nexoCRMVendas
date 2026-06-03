import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
const STORAGE_KEY = 'crmvendas.banner.pipelines-ready';
export function PipelinesReadyBanner() {
    const [hidden, setHidden] = useState(() => typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY) === '1');
    if (hidden)
        return null;
    function dismiss() {
        window.localStorage.setItem(STORAGE_KEY, '1');
        setHidden(true);
    }
    return (_jsxs("div", { className: "mb-4 flex items-center gap-4 rounded-xl border border-brand-200 bg-brand-50 p-4", children: [_jsx("span", { className: "grid h-10 w-10 place-items-center rounded-lg bg-brand-500 text-white", children: _jsx(Sparkles, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-bold text-foreground", children: "Seus pipelines est\u00E3o prontos!" }), _jsx("p", { className: "text-sm text-foreground/80", children: "Criamos um pipeline com est\u00E1gios sugeridos para o seu setor. Voc\u00EA pode ajustar os est\u00E1gios a qualquer momento para refletir seu processo comercial." })] }), _jsx(Button, { size: "sm", onClick: dismiss, children: "Got it" }), _jsx("button", { type: "button", onClick: dismiss, "aria-label": "Fechar", className: "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-brand-100", children: _jsx(X, { className: "h-4 w-4" }) })] }));
}
