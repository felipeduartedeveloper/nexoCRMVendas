import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Inbox, FileEdit, Send, Archive, PenSquare, Mail, Shield, Sparkles, Users, Lock, ChevronDown, CheckCircle2, TrendingUp, Zap, Trophy, } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/cn';
const FOLDERS = [
    { value: 'inbox', label: 'Inbox', icon: Inbox },
    { value: 'drafts', label: 'Drafts', icon: FileEdit },
    { value: 'outbox', label: 'Outbox', icon: Mail },
    { value: 'sent', label: 'Sent', icon: Send },
    { value: 'archive', label: 'Archive', icon: Archive },
];
const FEATURES = [
    {
        icon: Sparkles,
        title: 'Powerful features',
        desc: 'Link emails to deals and leads. Send emails in bulk, track opens and clicks, set up templates.',
    },
    {
        icon: Zap,
        title: 'Enhanced tools',
        desc: 'Write and summarize conversations using AI.',
    },
    {
        icon: Users,
        title: 'Team Inbox',
        desc: 'Add team members to collaborate in the same inbox. Assign emails for better collaboration.',
    },
    {
        icon: Lock,
        title: 'Secure and private',
        desc: 'You decide who can see your emails. Your data is safe with us.',
    },
];
const STATS = [
    { value: '3.4x', label: 'Add 3.4x more deals' },
    { value: '20%', label: 'Close deals 20% faster' },
    { value: '23%', label: 'Win 23% more deals' },
];
const FAQS = [
    {
        q: 'How does two-way email sync work?',
        a: 'Após ativar, conversas são sincronizadas nos dois sentidos. Você pode usar a Sales Inbox ou seu provedor (Gmail/Outlook) — as mensagens aparecem em ambos.',
    },
    {
        q: 'Can I control which emails are private or shared with my team?',
        a: 'Sim. Por padrão suas conversas são privadas. Você pode marcar threads específicos como compartilhados com o time, ou liberar tudo se quiser uma caixa colaborativa.',
    },
    {
        q: 'How does oxlify handle email security?',
        a: 'Usamos OAuth (sem armazenar senhas), criptografia em trânsito e repouso, e auditoria de acesso. SUPER_ADMIN pode revogar tokens individualmente.',
    },
    {
        q: 'Do my emails automatically link with contacts, deals and leads?',
        a: 'Sim. Por endereço de e-mail do destinatário/remetente, vinculamos automaticamente a contatos e seus deals/leads.',
    },
];
export function SalesInboxPage() {
    const user = useAuthStore((s) => s.user);
    const [folder, setFolder] = useState('inbox');
    const [openFaq, setOpenFaq] = useState(0);
    return (_jsxs("div", { className: "mx-auto max-w-[1400px]", children: [_jsx(PageHeader, { title: "Sales Inbox", subtitle: "Close deals faster with better email. Smart, secure, configurable.", actions: _jsxs(Button, { children: [_jsx(PenSquare, { className: "h-4 w-4" }), " New email"] }) }), _jsxs("div", { className: "mb-6 grid gap-4 lg:grid-cols-[260px_1fr]", children: [_jsxs("aside", { className: "rounded-xl border border-border bg-card p-3 shadow-card", children: [_jsxs("div", { className: "mb-3 rounded-lg border border-brand-200 bg-brand-50 p-3", children: [_jsx("div", { className: "text-[10px] font-bold uppercase tracking-wide text-brand-700", children: "Conta conectada" }), _jsx("div", { className: "mt-0.5 truncate text-sm font-semibold text-foreground", children: user?.email ?? 'não conectada' }), _jsxs("div", { className: "mt-1 text-xs text-muted-foreground", children: ["Inclu\u00EDdo no seu plano ", _jsx("strong", { children: "Premium" }), "."] })] }), _jsx("ul", { className: "space-y-0.5", children: FOLDERS.map((f) => (_jsx("li", { children: _jsxs("button", { type: "button", onClick: () => setFolder(f.value), className: cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', folder === f.value
                                            ? 'bg-brand-50 text-brand-700'
                                            : 'text-foreground/80 hover:bg-muted'), children: [_jsx(f.icon, { className: "h-4 w-4" }), _jsx("span", { className: "flex-1 text-left", children: f.label }), _jsx("span", { className: "rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground", children: "0" })] }) }, f.value))) })] }), _jsxs("section", { className: "rounded-xl border border-border bg-card p-8 text-center shadow-card", children: [_jsx("span", { className: "grid h-12 w-12 mx-auto place-items-center rounded-lg bg-brand-100 text-brand-700", children: _jsx(Mail, { className: "h-6 w-6" }) }), _jsx("h2", { className: "mt-4 text-xl font-extrabold text-foreground", children: "Conecte sua caixa de e-mails" }), _jsx("p", { className: "mx-auto mt-2 max-w-md text-sm text-muted-foreground", children: "Sincronize Gmail ou Outlook em dois cliques. Suas conversas v\u00E3o aparecer vinculadas a contatos e deals automaticamente." }), _jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-3", children: [_jsxs(Button, { size: "lg", children: [_jsx(Mail, { className: "h-4 w-4" }), " Conectar Gmail"] }), _jsxs(Button, { size: "lg", variant: "outline", children: [_jsx(Mail, { className: "h-4 w-4" }), " Conectar Outlook"] })] }), _jsxs("div", { className: "mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground", children: [_jsx(Shield, { className: "h-3.5 w-3.5" }), " OAuth seguro. N\u00E3o armazenamos senhas."] })] })] }), _jsx("section", { className: "mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: FEATURES.map((f) => (_jsxs("div", { className: "rounded-xl border border-border bg-card p-5 shadow-card", children: [_jsx("span", { className: "grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600", children: _jsx(f.icon, { className: "h-5 w-5" }) }), _jsx("h3", { className: "mt-3 text-base font-bold text-foreground", children: f.title }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: f.desc })] }, f.title))) }), _jsx("section", { className: "mb-6 grid gap-4 md:grid-cols-3", children: STATS.map((s, idx) => (_jsxs("div", { className: "flex items-center gap-4 rounded-xl border border-brand-200 bg-brand-50/40 p-5", children: [_jsxs("span", { className: "grid h-12 w-12 place-items-center rounded-lg bg-brand-500 text-white", children: [idx === 0 && _jsx(TrendingUp, { className: "h-6 w-6" }), idx === 1 && _jsx(Zap, { className: "h-6 w-6" }), idx === 2 && _jsx(Trophy, { className: "h-6 w-6" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-3xl font-extrabold tracking-tight text-brand-700", children: s.value }), _jsx("div", { className: "text-xs font-semibold text-foreground/80", children: s.label })] })] }, s.value))) }), _jsxs("section", { className: "rounded-xl border border-border bg-card p-6 shadow-card", children: [_jsx("h2", { className: "mb-4 text-lg font-bold text-foreground", children: "Frequently asked questions" }), _jsx("ul", { className: "divide-y divide-border/50", children: FAQS.map((f, idx) => {
                            const open = openFaq === idx;
                            return (_jsxs("li", { className: "py-3", children: [_jsxs("button", { type: "button", onClick: () => setOpenFaq(open ? null : idx), className: "flex w-full items-center justify-between gap-3 text-left", children: [_jsx("span", { className: "font-semibold text-foreground", children: f.q }), _jsx(ChevronDown, { className: cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180') })] }), open && _jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: f.a })] }, f.q));
                        }) }), _jsxs("div", { className: "mt-4 flex items-center gap-2 text-xs text-success", children: [_jsx(CheckCircle2, { className: "h-3.5 w-3.5" }), "Saiba mais em ", _jsx("a", { href: "#", className: "underline", children: "/help/sales-inbox" })] })] })] }));
}
