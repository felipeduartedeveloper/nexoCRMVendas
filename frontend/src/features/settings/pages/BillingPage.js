import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { settingsApi, billingApi } from '@/api/settings.api';
import { cn } from '@/lib/cn';
const PLANS = [
    {
        code: 'ESSENTIAL',
        name: 'Essential',
        price: 'R$ 49 / usuário / mês',
        features: ['Pipeline ilimitado', 'Até 3 usuários', 'Importação CSV', 'Histórico de contatos'],
    },
    {
        code: 'ADVANCED',
        name: 'Advanced',
        price: 'R$ 89 / usuário / mês',
        features: ['Sales Inbox', 'Automações básicas', 'Até 10 usuários', 'Relatórios avançados'],
    },
    {
        code: 'PROFESSIONAL',
        name: 'Professional',
        highlight: true,
        price: 'R$ 149 / usuário / mês',
        features: ['Automações avançadas', 'Usuários ilimitados', 'API REST', 'Suporte prioritário'],
    },
    {
        code: 'POWER',
        name: 'Power',
        price: 'R$ 199 / usuário / mês',
        features: ['Tudo do Pro', 'Suporte 24/7', 'Custom fields ilimitados'],
    },
    {
        code: 'ENTERPRISE',
        name: 'Enterprise',
        price: 'Sob consulta',
        features: ['SSO/SAML', 'Auditoria avançada', 'SLA dedicado', 'Treinamento on-site'],
    },
];
export function BillingPage() {
    const q = useQuery({ queryKey: ['settings-org'], queryFn: settingsApi.currentOrg });
    const current = q.data?.plan ?? 'TRIAL';
    const access = q.data?.access;
    const [loading, setLoading] = useState(null);
    const subscribe = async (plan) => {
        setLoading(plan);
        try {
            const origin = window.location.origin;
            const { url } = await billingApi.checkout({
                plan,
                cycle: 'monthly',
                successUrl: `${origin}/settings/billing?status=success`,
                cancelUrl: `${origin}/settings/billing?status=cancel`,
            });
            window.location.href = url;
        }
        catch {
            setLoading(null);
            alert('Não foi possível iniciar o checkout. Tente novamente.');
        }
    };
    return (_jsxs("div", { className: "mx-auto max-w-5xl", children: [_jsxs("header", { className: "mb-6", children: [_jsx("h1", { className: "text-2xl font-extrabold tracking-tight text-foreground", children: "Billing" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Gerencie seu plano e veja o hist\u00F3rico de cobran\u00E7a." })] }), access?.status === 'trial' && (_jsxs("div", { className: "mb-4 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-700", children: ["Teste gr\u00E1tis: ", _jsx("strong", { children: access.daysLeft }), " ", access.daysLeft === 1 ? 'dia restante' : 'dias restantes', ". Assine para n\u00E3o perder o acesso."] })), access?.status === 'expired' && (_jsx("div", { className: "mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger", children: "Seu teste gr\u00E1tis expirou. Assine um plano para reativar o acesso \u2014 seus dados est\u00E3o guardados." })), _jsx("section", { className: "mb-6 rounded-xl border border-brand-200 bg-brand-50 p-5", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "grid h-12 w-12 place-items-center rounded-lg bg-brand-500 text-white", children: _jsx(CreditCard, { className: "h-6 w-6" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-xs font-bold uppercase tracking-wide text-brand-700", children: "Plano atual" }), _jsx("div", { className: "text-xl font-extrabold text-foreground", children: current })] }), _jsx(Button, { variant: "outline", size: "sm", children: "Hist\u00F3rico de faturas" })] }) }), _jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: PLANS.map((p) => {
                    const active = p.code === current;
                    return (_jsxs("div", { className: cn('flex flex-col rounded-xl border bg-card p-6 shadow-card transition-shadow', active
                            ? 'border-brand-500 ring-2 ring-brand-100'
                            : p.highlight
                                ? 'border-brand-300'
                                : 'border-border hover:shadow-elevated'), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-base font-bold text-foreground", children: p.name }), active && (_jsx("span", { className: "rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-success", children: "Seu plano" }))] }), _jsx("div", { className: "mt-2 text-sm font-semibold text-brand-700", children: p.price }), _jsx("ul", { className: "mt-4 space-y-1.5 text-sm text-foreground/80", children: p.features.map((f) => (_jsxs("li", { className: "flex items-center gap-1.5", children: [_jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-success" }), f] }, f))) }), _jsx(Button, { className: "mt-6", variant: active ? 'outline' : 'primary', disabled: active || loading !== null, onClick: () => {
                                    if (p.code === 'ENTERPRISE') {
                                        window.location.href = 'mailto:contato@oxlify.com?subject=Plano Enterprise';
                                    }
                                    else if (!active) {
                                        subscribe(p.code.toLowerCase());
                                    }
                                }, children: active
                                    ? 'Plano atual'
                                    : p.code === 'ENTERPRISE'
                                        ? 'Falar com vendas'
                                        : loading === p.code.toLowerCase()
                                            ? 'Redirecionando…'
                                            : 'Assinar' })] }, p.code));
                }) })] }));
}
