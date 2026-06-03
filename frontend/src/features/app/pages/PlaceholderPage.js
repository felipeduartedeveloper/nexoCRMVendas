import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Construction } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
export function PlaceholderPage({ title, subtitle, }) {
    return (_jsxs("div", { className: "mx-auto max-w-7xl", children: [_jsx(PageHeader, { title: title, subtitle: subtitle }), _jsxs("div", { className: "grid place-items-center rounded-xl border border-dashed border-border bg-card p-12 text-center", children: [_jsx(Construction, { className: "h-12 w-12 text-muted-foreground/70" }), _jsx("p", { className: "mt-4 max-w-md text-sm text-muted-foreground", children: "Esta se\u00E7\u00E3o ser\u00E1 implementada na pr\u00F3xima sprint. Toda a navega\u00E7\u00E3o, layout e fluxo principal j\u00E1 est\u00E3o preparados \u2014 basta plugar a p\u00E1gina completa." })] })] }));
}
