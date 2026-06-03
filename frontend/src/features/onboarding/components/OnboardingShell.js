import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Check } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/cn';
const steps = [
    { idx: 1, label: 'Sobre você' },
    { idx: 2, label: 'Sobre a empresa' },
    { idx: 3, label: 'Tudo pronto' },
];
export function OnboardingShell({ step, title, subtitle, children, rightHero }) {
    return (_jsxs("div", { className: "min-h-screen bg-card md:grid md:grid-cols-[1fr_minmax(0,40%)]", children: [_jsxs("div", { className: "flex min-h-screen flex-col", children: [_jsxs("header", { className: "container-wide flex items-center justify-between py-6", children: [_jsx(Logo, {}), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["Etapa ", step, " de ", steps.length] })] }), _jsx("div", { className: "container-wide pb-2", children: _jsx("ol", { className: "flex items-center gap-3 text-xs font-medium text-muted-foreground", children: steps.map((s, i) => {
                                const done = s.idx < step;
                                const active = s.idx === step;
                                return (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: cn('inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold', done
                                                ? 'border-success bg-success text-white'
                                                : active
                                                    ? 'border-brand-600 bg-brand-600 text-white'
                                                    : 'border-border bg-card text-muted-foreground'), children: done ? _jsx(Check, { className: "h-3.5 w-3.5" }) : s.idx }), _jsx("span", { className: cn('whitespace-nowrap', (active || done) && 'text-foreground'), children: s.label }), i < steps.length - 1 && (_jsx("span", { className: cn('h-px w-6 sm:w-12', done ? 'bg-success' : 'bg-muted') }))] }, s.idx));
                            }) }) }), _jsx("main", { className: "container-wide flex-1 py-10", children: _jsxs("div", { className: "mx-auto max-w-xl", children: [_jsx("h1", { className: "text-3xl font-extrabold tracking-tight text-foreground", children: title }), subtitle && _jsx("p", { className: "mt-2 text-muted-foreground", children: subtitle }), _jsx("div", { className: "mt-8", children: children })] }) })] }), _jsx("aside", { className: "hidden bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 md:block", children: _jsx("div", { className: "sticky top-0 flex h-screen flex-col justify-center px-12 text-white", children: rightHero ?? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "rounded-2xl bg-card/10 p-6 backdrop-blur", children: [_jsx("p", { className: "text-lg font-semibold leading-snug", children: "\"Em 30 dias triplicamos o n\u00FAmero de deals fechados. oxlify \u00E9 simples como uma planilha, poderoso como um CRM de verdade.\"" }), _jsxs("div", { className: "mt-4 flex items-center gap-3", children: [_jsx("div", { className: "h-10 w-10 rounded-full bg-card/30" }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: "Carolina Mendes" }), _jsx("div", { className: "text-sm text-brand-100", children: "Head of Sales \u00B7 Acme Tech" })] })] })] }), _jsxs("ul", { className: "mt-8 space-y-2 text-sm text-brand-50", children: [_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(Check, { className: "h-4 w-4" }), " Pipeline pronto em 1 minuto"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(Check, { className: "h-4 w-4" }), " Importa\u00E7\u00E3o CSV/XLSX nativa"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(Check, { className: "h-4 w-4" }), " Times ilimitados nos planos Pro+"] })] })] })) }) })] }));
}
