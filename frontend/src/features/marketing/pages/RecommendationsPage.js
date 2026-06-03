import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Sparkles, X } from 'lucide-react';
import { marketingApi } from '@/api/marketing.api';
const TYPE_LABELS = {
    REACTIVATE_INACTIVE: 'Reativação',
    FOLLOWUP_STALE_DEAL: 'Follow-up',
    UPSELL: 'Upsell',
    CROSS_SELL: 'Cross-sell',
    WELCOME_NEW: 'Boas-vindas',
};
export function RecommendationsPage() {
    const qc = useQueryClient();
    const { data = [] } = useQuery({
        queryKey: ['marketing', 'recommendations'],
        queryFn: marketingApi.listRecommendations,
    });
    const generateMut = useMutation({
        mutationFn: marketingApi.generateRecommendations,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'recommendations'] }),
    });
    const acceptMut = useMutation({
        mutationFn: (id) => marketingApi.acceptRecommendation(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'recommendations'] }),
    });
    const dismissMut = useMutation({
        mutationFn: (id) => marketingApi.dismissRecommendation(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'recommendations'] }),
    });
    return (_jsxs("div", { className: "flex h-full flex-col", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-foreground", children: "Recomenda\u00E7\u00F5es" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Sugest\u00F5es autom\u00E1ticas de a\u00E7\u00F5es de marketing baseadas no seu CRM." })] }), _jsxs("button", { type: "button", onClick: () => generateMut.mutate(), disabled: generateMut.isPending, className: "inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50", children: [_jsx(Sparkles, { className: "h-4 w-4" }), generateMut.isPending ? 'Gerando...' : 'Gerar novas'] })] }), _jsxs("div", { className: "flex-1 space-y-3 overflow-auto p-6", children: [data.length === 0 && (_jsxs("div", { className: "grid place-items-center p-16 text-center", children: [_jsx(Sparkles, { className: "h-12 w-12 text-muted-foreground/50" }), _jsx("h2", { className: "mt-3 text-base font-semibold text-foreground", children: "Sem recomenda\u00E7\u00F5es" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Clique em \"Gerar novas\" pra receber sugest\u00F5es autom\u00E1ticas." })] })), data.map((r) => (_jsxs("div", { className: "flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-card", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "inline-flex rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700", children: TYPE_LABELS[r.type] }), _jsx("h3", { className: "font-semibold text-foreground", children: r.title })] }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: r.description }), _jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: ["Impacto estimado: ", _jsx("strong", { children: r.estimatedImpact })] })] }), _jsxs("div", { className: "flex gap-1", children: [_jsxs("button", { type: "button", onClick: () => acceptMut.mutate(r.id), title: "Aceitar", className: "inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-semibold text-success hover:bg-success/20", children: [_jsx(Check, { className: "h-3.5 w-3.5" }), " Aceitar"] }), _jsxs("button", { type: "button", onClick: () => dismissMut.mutate(r.id), title: "Descartar", className: "inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground/80 hover:bg-muted", children: [_jsx(X, { className: "h-3.5 w-3.5" }), " Descartar"] })] })] }, r.id)))] })] }));
}
