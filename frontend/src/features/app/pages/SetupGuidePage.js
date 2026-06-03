import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Users, Trophy, Mail, Settings, CheckCircle2, ChevronDown, ChevronRight, ArrowRight, } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
const goals = [
    {
        key: 'pipeline',
        icon: Trophy,
        title: 'Configure seu pipeline',
        desc: 'Defina as etapas do seu funil de vendas para começar a acompanhar negócios.',
        tasks: [
            { label: 'Pipeline padrão criado', done: true },
            { label: 'Personalizar etapas', done: false, to: '/settings/pipelines' },
            { label: 'Criar seu primeiro deal', done: false, to: '/deals/new' },
        ],
    },
    {
        key: 'contacts',
        icon: Users,
        title: 'Importe seus contatos',
        desc: 'Traga contatos da sua planilha ou conecte com fontes existentes.',
        tasks: [
            { label: 'Adicionar contatos manualmente', done: false, to: '/contacts' },
            { label: 'Importar CSV / XLSX', done: false, to: '/contacts?import=1' },
            { label: 'Conectar Google Contacts', done: false, to: '/integrations' },
        ],
    },
    {
        key: 'inbox',
        icon: Mail,
        title: 'Conecte sua caixa de e-mails',
        desc: 'Sincronize e-mails enviados e recebidos com os deals automaticamente.',
        tasks: [
            { label: 'Conectar Gmail', done: false, to: '/sales-inbox/connect' },
            { label: 'Definir assinatura padrão', done: false, to: '/settings/email' },
        ],
    },
    {
        key: 'team',
        icon: Settings,
        title: 'Convide seu time',
        desc: 'Adicione vendedores, gerentes e defina permissões.',
        tasks: [
            { label: 'Convidar pessoas', done: false, to: '/settings/users' },
            { label: 'Definir papéis e permissões', done: false, to: '/settings/permissions' },
        ],
    },
];
export function SetupGuidePage() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(goals[0].key);
    const totalDone = goals.reduce((acc, g) => acc + g.tasks.filter((t) => t.done).length, 0);
    const totalTasks = goals.reduce((acc, g) => acc + g.tasks.length, 0);
    const progress = Math.round((totalDone / totalTasks) * 100);
    return (_jsxs("div", { className: "mx-auto max-w-5xl", children: [_jsx(PageHeader, { title: "Guia de configura\u00E7\u00E3o", subtitle: "Comece pelas tarefas essenciais. Em ~5 minutos seu CRM estar\u00E1 pronto.", actions: _jsxs(Button, { variant: "outline", onClick: () => navigate('/dashboard'), children: ["Pular para o dashboard ", _jsx(ArrowRight, { className: "h-4 w-4" })] }) }), _jsx("div", { className: "mb-6 rounded-xl border border-brand-100 bg-brand-50/60 p-5", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "grid h-12 w-12 place-items-center rounded-lg bg-brand-500 text-white", children: _jsx(Compass, { className: "h-6 w-6" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-bold text-foreground", children: "Seu progresso" }), _jsx("div", { className: "mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-100", children: _jsx("div", { className: "h-full rounded-full bg-brand-500 transition-all", style: { width: `${progress}%` } }) }), _jsxs("div", { className: "mt-2 text-xs font-medium text-brand-800", children: [totalDone, " de ", totalTasks, " tarefas conclu\u00EDdas \u00B7 ", progress, "%"] })] })] }) }), _jsx("div", { className: "space-y-3", children: goals.map((g) => {
                    const isOpen = open === g.key;
                    const done = g.tasks.filter((t) => t.done).length;
                    return (_jsxs("div", { className: "overflow-hidden rounded-xl border border-border bg-card shadow-card", children: [_jsxs("button", { type: "button", onClick: () => setOpen(isOpen ? null : g.key), className: "flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-muted/40", children: [_jsx("span", { className: cn('grid h-12 w-12 place-items-center rounded-lg', done === g.tasks.length
                                            ? 'bg-success/10 text-success'
                                            : 'bg-brand-50 text-brand-600'), children: done === g.tasks.length ? (_jsx(CheckCircle2, { className: "h-6 w-6" })) : (_jsx(g.icon, { className: "h-6 w-6" })) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-bold text-foreground", children: g.title }), _jsx("div", { className: "text-sm text-muted-foreground", children: g.desc })] }), _jsxs("span", { className: "hidden text-xs font-semibold text-muted-foreground sm:inline", children: [done, "/", g.tasks.length] }), isOpen ? (_jsx(ChevronDown, { className: "h-5 w-5 text-muted-foreground/70" })) : (_jsx(ChevronRight, { className: "h-5 w-5 text-muted-foreground/70" }))] }), isOpen && (_jsx("ul", { className: "border-t border-border/50 p-3", children: g.tasks.map((t) => (_jsxs("li", { className: "flex items-center gap-3 p-2", children: [_jsx("span", { className: 'grid h-5 w-5 place-items-center rounded-full border ' +
                                                (t.done
                                                    ? 'border-success bg-success text-white'
                                                    : 'border-border bg-card'), children: t.done && _jsx(CheckCircle2, { className: "h-3 w-3" }) }), _jsx("span", { className: 'flex-1 text-sm ' +
                                                (t.done
                                                    ? 'text-muted-foreground/70 line-through'
                                                    : 'text-foreground/90'), children: t.label }), !t.done && t.to && (_jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(t.to), children: "Fazer agora" }))] }, t.label))) }))] }, g.key));
                }) })] }));
}
