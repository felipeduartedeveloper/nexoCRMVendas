import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Users, Activity as ActivityIcon, Trophy, CheckCircle2, Star, ArrowLeft, ArrowRight, Phone, Building2, Calendar, } from 'lucide-react';
import { OnboardingShell } from '../components/OnboardingShell';
import { Button } from '@/components/ui/Button';
import { useOnboardingDraft } from '../store/onboarding-draft.store';
import { onboardingApi } from '@/api/onboarding.api';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';
import { extractErrorMessage } from '@/lib/api';
const tabs = [
    { key: 'contacts', label: 'Contatos', icon: Users },
    { key: 'activities', label: 'Atividades', icon: ActivityIcon },
    { key: 'deals', label: 'Negócios', icon: Trophy },
];
const sampleContacts = [
    { name: 'Benjamin Leon', email: 'benjamin@moveer.com', phone: '+55 11 98765-4321', company: 'MoveEr' },
    { name: 'Tony Turner', email: 'tony@moveer.com', phone: '+55 11 91234-5678', company: 'MoveEr' },
];
const sampleActivities = [
    {
        type: 'Ligação',
        icon: Phone,
        title: 'Final attempt — Tony Turner',
        due: 'Amanhã · 10:00',
        deal: '[Sample] Tony Turner / MoveEr',
    },
    {
        type: 'Reunião',
        icon: Calendar,
        title: 'Context call — MoveEr',
        due: 'Em 2 dias · 14:30',
        deal: '[Sample] Tony Turner / MoveEr',
    },
];
const sampleStages = [
    { key: 'new', label: 'Novo deal' },
    { key: 'contact', label: 'Contato feito' },
    { key: 'qualified', label: 'Qualificado' },
    { key: 'meeting', label: 'Reunião concluída' },
    { key: 'negotiation', label: 'Negociação' },
    { key: 'signed', label: 'Fechado · ganho' },
];
const sampleDeal = {
    title: '[Sample] Tony Turner / MoveEr',
    value: 30000,
    currency: 'GBP',
    stage: 'contact',
};
export function SetupTourPage() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('contacts');
    const [showFeedback, setShowFeedback] = useState(false);
    const draft = useOnboardingDraft();
    const setUser = useAuthStore((s) => s.setUser);
    const currencyFmt = useMemo(() => new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: sampleDeal.currency,
        maximumFractionDigits: 0,
    }), []);
    const complete = useMutation({
        mutationFn: () => onboardingApi.complete({
            personal: draft.personal,
            company: draft.company,
            feedbackScore: draft.feedbackScore ?? undefined,
        }),
        onSuccess: async () => {
            try {
                const me = await authApi.me();
                setUser(me);
            }
            catch {
                /* noop */
            }
            draft.reset();
            toast.success('Pronto! Bem-vindo ao oxlify.');
            navigate('/dashboard');
        },
        onError: (err) => toast.error(extractErrorMessage(err, 'Falha ao concluir setup.')),
    });
    function finish() {
        setShowFeedback(true);
    }
    function submitFinal() {
        complete.mutate();
    }
    return (_jsxs(OnboardingShell, { step: 3, title: "Tudo pronto. Veja o que j\u00E1 criamos para voc\u00EA.", subtitle: "Carregamos contatos, atividades e um deal de exemplo para voc\u00EA explorar.", children: [_jsxs("div", { className: "rounded-xl border border-border bg-card shadow-card", children: [_jsx("div", { className: "flex border-b border-border", children: tabs.map((t) => {
                            const active = tab === t.key;
                            return (_jsxs("button", { type: "button", onClick: () => setTab(t.key), className: 'flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ' +
                                    (active
                                        ? 'border-brand-600 text-brand-700'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'), children: [_jsx(t.icon, { className: "h-4 w-4" }), " ", t.label] }, t.key));
                        }) }), _jsxs("div", { className: "p-5", children: [tab === 'contacts' && (_jsx("ul", { className: "divide-y divide-border/50", children: sampleContacts.map((c) => (_jsxs("li", { className: "flex items-center gap-4 py-3", children: [_jsx("div", { className: "grid h-10 w-10 place-items-center rounded-full bg-brand-50 font-bold text-brand-700", children: c.name
                                                .split(' ')
                                                .map((w) => w[0])
                                                .slice(0, 2)
                                                .join('') }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-semibold text-foreground", children: c.name }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [c.email, " \u00B7 ", c.phone] })] }), _jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground/80", children: [_jsx(Building2, { className: "h-3 w-3" }), " ", c.company] })] }, c.email))) })), tab === 'activities' && (_jsx("ul", { className: "space-y-2", children: sampleActivities.map((a) => (_jsxs("li", { className: "flex items-center gap-4 rounded-lg border border-border p-3", children: [_jsx("div", { className: "grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700", children: _jsx(a.icon, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-semibold text-foreground", children: a.title }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [a.due, " \u00B7 ", a.deal] })] }), _jsx("span", { className: "rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning", children: a.type })] }, a.title))) })), tab === 'deals' && (_jsx("div", { className: "grid grid-cols-3 gap-2", children: sampleStages.slice(0, 3).map((s) => (_jsxs("div", { className: "rounded-lg bg-muted/40 p-2", children: [_jsx("div", { className: "mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground", children: s.label }), s.key === sampleDeal.stage ? (_jsxs("div", { className: "rounded-lg border border-border bg-card p-3 shadow-card", children: [_jsx("div", { className: "font-semibold text-foreground", children: sampleDeal.title }), _jsx("div", { className: "mt-1 text-sm text-muted-foreground", children: "MoveEr \u00B7 Tony Turner" }), _jsx("div", { className: "mt-2 inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-bold text-success", children: currencyFmt.format(sampleDeal.value) })] })) : (_jsx("div", { className: "h-20 rounded-lg border border-dashed border-border" }))] }, s.key))) }))] })] }), _jsxs("div", { className: "mt-6 rounded-xl border border-success/20 bg-success/5 p-4 text-sm text-success", children: [_jsxs("div", { className: "flex items-center gap-2 font-semibold", children: [_jsx(CheckCircle2, { className: "h-4 w-4" }), " Configura\u00E7\u00E3o inicial conclu\u00EDda"] }), _jsx("p", { className: "mt-1 text-success/80", children: "Voc\u00EA pode editar, remover ou criar novos dados a qualquer momento dentro do app." })] }), _jsxs("div", { className: "mt-6 flex items-center justify-between", children: [_jsxs(Button, { type: "button", variant: "ghost", onClick: () => navigate('/onboarding/company'), children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), " Voltar"] }), _jsxs(Button, { type: "button", size: "lg", onClick: finish, children: ["Entrar no app ", _jsx(ArrowRight, { className: "h-4 w-4" })] })] }), showFeedback && (_jsx(FeedbackModal, { onSkip: submitFinal, onSubmit: (score) => {
                    draft.setFeedbackScore(score);
                    submitFinal();
                }, loading: complete.isPending }))] }));
}
function FeedbackModal({ onSkip, onSubmit, loading, }) {
    const [score, setScore] = useState(null);
    return (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-xl bg-card p-6 shadow-elevated", children: [_jsx("h3", { className: "text-lg font-bold text-foreground", children: "Como foi sua configura\u00E7\u00E3o inicial?" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Seu feedback nos ajuda a melhorar." }), _jsx("div", { className: "mt-5 flex justify-center gap-2", children: [1, 2, 3, 4, 5].map((n) => (_jsx("button", { type: "button", onClick: () => setScore(n), className: "rounded-full p-1 transition-transform hover:scale-110", "aria-label": `Nota ${n}`, children: _jsx(Star, { className: 'h-8 w-8 ' +
                                ((score ?? 0) >= n
                                    ? 'fill-warning text-warning'
                                    : 'text-muted-foreground/50') }) }, n))) }), _jsxs("div", { className: "mt-6 flex items-center justify-end gap-2", children: [_jsx(Button, { variant: "ghost", onClick: onSkip, disabled: loading, children: "Pular" }), _jsx(Button, { disabled: !score, loading: loading, onClick: () => onSubmit(score), children: "Enviar e continuar" })] })] }) }));
}
