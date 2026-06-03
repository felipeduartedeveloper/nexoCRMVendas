import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Inbox, Bot, MessageCircle, FileText, Search, Globe, Linkedin, Plus, Upload, ArrowRight, Sparkles, Send, Building2, } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { leadsApi } from '@/api/leads.api';
import { extractErrorMessage } from '@/lib/api';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/cn';
const MENU = [
    {
        group: 'Leads',
        items: [{ value: 'leads-inbox', label: 'Leads Inbox', icon: Inbox }],
    },
    {
        group: 'LeadBooster',
        items: [
            { value: 'live-chat', label: 'Live Chat', icon: MessageCircle },
            { value: 'chatbot', label: 'Chatbot', icon: Bot },
            { value: 'web-forms', label: 'Web Forms', icon: FileText },
            { value: 'prospector', label: 'Prospector', icon: Search },
        ],
    },
    {
        group: 'Add-ons',
        items: [{ value: 'web-visitors', label: 'Web Visitors', icon: Globe }],
    },
    {
        group: 'Integrations',
        items: [{ value: 'linkedin', label: 'LinkedIn', icon: Linkedin }],
    },
];
export function LeadsPage() {
    const [section, setSection] = useState('leads-inbox');
    return (_jsxs("div", { className: "mx-auto max-w-[1500px]", children: [_jsx(PageHeader, { title: "Leads", subtitle: "Capture, qualifique e converta leads em deals." }), _jsxs("div", { className: "grid gap-4 lg:grid-cols-[260px_1fr]", children: [_jsx("aside", { className: "rounded-xl border border-border bg-card p-3 shadow-card", children: MENU.map((g) => (_jsxs("div", { className: "mb-4 last:mb-0", children: [_jsx("div", { className: "mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground", children: g.group }), _jsx("ul", { className: "space-y-0.5", children: g.items.map((it) => (_jsx("li", { children: _jsxs("button", { type: "button", onClick: () => setSection(it.value), className: cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', section === it.value
                                                ? 'bg-brand-50 text-brand-700'
                                                : 'text-foreground/80 hover:bg-muted'), children: [_jsx(it.icon, { className: "h-4 w-4" }), _jsx("span", { className: "flex-1 text-left", children: it.label })] }) }, it.value))) })] }, g.group))) }), _jsxs("main", { className: "min-w-0", children: [section === 'leads-inbox' && _jsx(LeadsInbox, {}), section === 'live-chat' && (_jsx(FeatureCard, { icon: MessageCircle, title: "Live Chat", tagline: "Converse com visitantes do site em tempo real.", description: "Embed um widget de chat no seu site para capturar leads aquecidos no momento certo. Cada conversa vira um lead automaticamente.", cta: "Instalar widget" })), section === 'chatbot' && (_jsx(FeatureCard, { icon: Bot, title: "Chatbot", tagline: "Qualifique leads 24/7 com fluxos personalizados.", description: "Crie chatbots no-code que perguntam, qualificam e atribuem leads automaticamente ao vendedor certo, em qualquer hor\u00E1rio.", cta: "Criar primeiro bot" })), section === 'web-forms' && (_jsx(FeatureCard, { icon: FileText, title: "Web Forms", tagline: "Formul\u00E1rios customiz\u00E1veis para o seu site.", description: "Crie formul\u00E1rios, embed no site, gere leads automaticamente. Suporte a campos customizados, valida\u00E7\u00E3o e webhook.", cta: "Criar formul\u00E1rio" })), section === 'prospector' && (_jsx(FeatureCard, { icon: Search, title: "Prospector", tagline: "Encontre leads B2B usando filtros avan\u00E7ados.", description: "Base de dados de mais de 400 milh\u00F5es de profissionais com filtros por ind\u00FAstria, cargo, localiza\u00E7\u00E3o e tamanho da empresa.", cta: "Buscar agora" })), section === 'web-visitors' && (_jsx(FeatureCard, { icon: Globe, title: "Web Visitors", tagline: "Veja quais empresas est\u00E3o visitando seu site.", description: "Identifica\u00E7\u00E3o por IP reverso de empresas an\u00F4nimas que visitaram seu site. Veja jornada, p\u00E1ginas vistas e tempo gasto.", cta: "Habilitar tracking" })), section === 'linkedin' && (_jsx(FeatureCard, { icon: Linkedin, title: "LinkedIn Sales Navigator", tagline: "Integra\u00E7\u00E3o nativa com o LinkedIn.", description: "Importe leads do LinkedIn Sales Navigator direto para o CRM, sincronize hist\u00F3rico de mensagens InMail e veja perfis no contexto do deal.", cta: "Conectar conta" }))] })] })] }));
}
function LeadsInbox() {
    const qc = useQueryClient();
    const [openNew, setOpenNew] = useState(false);
    const q = useQuery({
        queryKey: ['leads-all'],
        queryFn: () => leadsApi.list({ limit: 200 }),
    });
    const counters = useQuery({ queryKey: ['leads-counters'], queryFn: leadsApi.counters });
    const archive = useMutation({
        mutationFn: (id) => leadsApi.archive(id),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['leads-all'] });
            await qc.invalidateQueries({ queryKey: ['leads-counters'] });
        },
    });
    const convert = useMutation({
        mutationFn: (id) => leadsApi.convert(id),
        onSuccess: async () => {
            toast.success('Lead convertido em deal!');
            await qc.invalidateQueries({ queryKey: ['leads-all'] });
            await qc.invalidateQueries({ queryKey: ['leads-counters'] });
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
    });
    const COLUMNS = [
        { status: 'INBOX', label: 'Inbox', color: 'border-brand-500' },
        { status: 'WORKING', label: 'Working', color: 'border-warning' },
        { status: 'ARCHIVED', label: 'Archived', color: 'border-muted-foreground/40' },
        { status: 'CONVERTED', label: 'Converted', color: 'border-success' },
    ];
    const byStatus = {
        INBOX: [],
        WORKING: [],
        ARCHIVED: [],
        CONVERTED: [],
    };
    (q.data?.items ?? []).forEach((l) => byStatus[l.status].push(l));
    const total = (counters.data?.inbox ?? 0) +
        (counters.data?.working ?? 0) +
        (counters.data?.archived ?? 0) +
        (counters.data?.converted ?? 0);
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-foreground", children: "Leads Inbox" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [total, " leads no total"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(Upload, { className: "h-4 w-4" }), " Importar planilha"] }), _jsxs(Button, { onClick: () => setOpenNew(true), children: [_jsx(Plus, { className: "h-4 w-4" }), " Novo lead"] })] })] }), !total && (_jsxs("div", { className: "rounded-xl border border-brand-200 bg-brand-50/40 p-8 text-center", children: [_jsx(Sparkles, { className: "mx-auto h-10 w-10 text-brand-500" }), _jsx("h3", { className: "mt-3 text-xl font-extrabold text-foreground", children: "Take your leads to the next level" }), _jsx("p", { className: "mx-auto mt-2 max-w-md text-sm text-foreground/80", children: "Add new lead or import your existing leads from spreadsheet." }), _jsxs("div", { className: "mt-5 flex flex-wrap justify-center gap-2", children: [_jsxs(Button, { onClick: () => setOpenNew(true), children: [_jsx(Plus, { className: "h-4 w-4" }), " Novo lead"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Upload, { className: "h-4 w-4" }), " Importar"] })] })] })), _jsx("div", { className: "grid gap-3 lg:grid-cols-4", children: COLUMNS.map((c) => {
                    const list = byStatus[c.status];
                    const total = list.reduce((acc, l) => acc + Number(l.value || 0), 0);
                    return (_jsxs("div", { className: "min-h-[300px]", children: [_jsxs("div", { className: cn('mb-2 rounded-t-lg border-b-2 bg-card p-3', c.color), children: [_jsxs("div", { className: "flex items-center justify-between text-xs font-bold uppercase tracking-wide", children: [_jsx("span", { className: "text-foreground", children: c.label }), _jsx("span", { className: "text-muted-foreground", children: list.length })] }), _jsx("div", { className: "mt-1 text-[11px] text-muted-foreground", children: formatMoney(total, list[0]?.currency ?? 'BRL') })] }), _jsx("div", { className: "space-y-2 rounded-b-lg bg-muted/40 p-2", children: !list.length ? (_jsx("div", { className: "grid h-20 place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground/70", children: "Sem leads" })) : (list.map((l) => (_jsxs("div", { className: "rounded-lg border border-border bg-card p-3 shadow-card", children: [_jsx("div", { className: "line-clamp-2 text-sm font-semibold text-foreground", children: l.title }), _jsxs("div", { className: "mt-1 flex items-center gap-2 text-xs", children: [_jsx("span", { className: "rounded-full bg-success/10 px-2 py-0.5 font-bold text-success", children: formatMoney(l.value, l.currency) }), l.source && (_jsxs("span", { className: "inline-flex items-center gap-1 text-muted-foreground", children: [_jsx(Building2, { className: "h-3 w-3" }), " ", l.source] }))] }), l.status !== 'CONVERTED' && l.status !== 'ARCHIVED' && (_jsxs("div", { className: "mt-2 flex gap-1", children: [_jsxs("button", { type: "button", onClick: () => convert.mutate(l.id), className: "inline-flex items-center gap-1 rounded bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-100", children: [_jsx(ArrowRight, { className: "h-3 w-3" }), " Converter"] }), _jsx("button", { type: "button", onClick: () => archive.mutate(l.id), className: "inline-flex items-center rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground hover:bg-muted", children: "Arquivar" })] }))] }, l.id)))) })] }, c.status));
                }) }), openNew && _jsx(NewLeadModal, { onClose: () => setOpenNew(false) })] }));
}
function NewLeadModal({ onClose }) {
    const qc = useQueryClient();
    const [title, setTitle] = useState('');
    const [value, setValue] = useState('');
    const [source, setSource] = useState('');
    const m = useMutation({
        mutationFn: () => leadsApi.create({ title, value: Number(value) || 0, source: source || undefined }),
        onSuccess: async () => {
            toast.success('Lead criado!');
            await qc.invalidateQueries({ queryKey: ['leads-all'] });
            await qc.invalidateQueries({ queryKey: ['leads-counters'] });
            onClose();
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
    });
    function onSubmit(e) {
        e.preventDefault();
        if (!title.trim())
            return toast.error('Informe um título.');
        m.mutate();
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4", children: _jsxs("form", { onSubmit: onSubmit, className: "w-full max-w-md space-y-4 rounded-xl bg-card p-6 shadow-elevated", children: [_jsx("h3", { className: "text-lg font-bold text-foreground", children: "Novo lead" }), _jsx(Input, { label: "T\u00EDtulo", value: title, onChange: (e) => setTitle(e.target.value), autoFocus: true, required: true }), _jsx(Input, { label: "Valor estimado", type: "number", min: 0, value: value, onChange: (e) => setValue(e.target.value) }), _jsx(Input, { label: "Origem (source)", placeholder: "Ex: Web Form, LinkedIn, Indica\u00E7\u00E3o", value: source, onChange: (e) => setSource(e.target.value) }), _jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [_jsx(Button, { variant: "ghost", type: "button", onClick: onClose, children: "Cancelar" }), _jsx(Button, { type: "submit", loading: m.isPending, children: "Criar lead" })] })] }) }));
}
function FeatureCard({ icon: Icon, title, tagline, description, cta, }) {
    return (_jsx("section", { className: "rounded-xl border border-border bg-card p-8 shadow-card", children: _jsxs("div", { className: "grid place-items-center text-center", children: [_jsx("span", { className: "grid h-14 w-14 place-items-center rounded-xl bg-brand-100 text-brand-700", children: _jsx(Icon, { className: "h-7 w-7" }) }), _jsx("h2", { className: "mt-4 text-2xl font-extrabold text-foreground", children: title }), _jsx("p", { className: "mt-1 text-sm font-semibold text-brand-700", children: tagline }), _jsx("p", { className: "mx-auto mt-3 max-w-xl text-sm text-muted-foreground", children: description }), _jsxs("div", { className: "mt-6 flex gap-2", children: [_jsxs(Button, { children: [_jsx(Send, { className: "h-4 w-4" }), " ", cta] }), _jsx(Button, { variant: "outline", children: "Saber mais" })] })] }) }));
}
