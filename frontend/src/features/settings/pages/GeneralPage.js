import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { settingsApi, labelsApi, lostReasonsApi, } from '@/api/settings.api';
import { extractErrorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
const TABS = [
    { value: 'general', label: 'General' },
    { value: 'activities', label: 'Activities' },
    { value: 'currencies', label: 'Currencies' },
    { value: 'lost-reasons', label: 'Lost reasons' },
    { value: 'labels', label: 'Labels' },
];
const MAINTENANCE_WINDOWS = [
    'No preference',
    '00:00 - 02:00 UTC',
    '02:00 - 04:00 UTC',
    '04:00 - 06:00 UTC',
    '06:00 - 08:00 UTC',
    '22:00 - 00:00 UTC',
];
export function GeneralPage() {
    const [tab, setTab] = useState('general');
    return (_jsxs("div", { className: "mx-auto max-w-4xl", children: [_jsxs("header", { className: "mb-6", children: [_jsx("h1", { className: "text-2xl font-extrabold tracking-tight text-foreground", children: "Company settings" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Configure prefer\u00EAncias gerais da sua empresa." })] }), _jsxs("div", { className: "rounded-xl border border-border bg-card shadow-card", children: [_jsx("nav", { className: "flex overflow-x-auto border-b border-border", role: "tablist", children: TABS.map((t) => (_jsx("button", { role: "tab", "aria-selected": tab === t.value, onClick: () => setTab(t.value), className: cn('shrink-0 border-b-2 px-5 py-3 text-sm font-semibold transition-colors', tab === t.value
                                ? 'border-brand-600 text-brand-700'
                                : 'border-transparent text-muted-foreground hover:text-foreground'), children: t.label }, t.value))) }), _jsxs("div", { className: "p-6", children: [tab === 'general' && _jsx(GeneralFields, {}), tab === 'activities' && (_jsx(Placeholder, { title: "Tipos de atividade", hint: "Personalize call, meeting, task etc." })), tab === 'currencies' && _jsx(CurrenciesTab, {}), tab === 'lost-reasons' && _jsx(LostReasonsList, {}), tab === 'labels' && _jsx(LabelsList, {})] })] })] }));
}
function GeneralFields() {
    const qc = useQueryClient();
    const q = useQuery({ queryKey: ['settings-org'], queryFn: settingsApi.currentOrg });
    const [draft, setDraft] = useState({});
    useEffect(() => {
        if (q.data)
            setDraft(q.data);
    }, [q.data?.id]);
    const m = useMutation({
        mutationFn: (data) => settingsApi.updateCurrentOrg(data),
        onSuccess: async () => {
            toast.success('Configurações salvas.');
            await qc.invalidateQueries({ queryKey: ['settings-org'] });
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
    });
    if (q.isLoading)
        return _jsx("div", { className: "text-sm text-muted-foreground", children: "Carregando\u2026" });
    return (_jsxs("form", { onSubmit: (e) => {
            e.preventDefault();
            m.mutate(draft);
        }, className: "space-y-5", children: [_jsx(Input, { label: "Company name", value: draft.name ?? '', onChange: (e) => setDraft((d) => ({ ...d, name: e.target.value })), required: true }), _jsxs("div", { children: [_jsx(Input, { label: "Company domain", placeholder: "suaempresa.com.br", value: draft.domain ?? '', onChange: (e) => setDraft((d) => ({ ...d, domain: e.target.value })) }), _jsx("p", { className: "field-hint", children: "O dom\u00EDnio \u00E9 usado para o endere\u00E7o Smart BCC e para a URL da sua conta no app web." })] }), _jsx(Input, { label: "Website", placeholder: "https://suaempresa.com.br", value: draft.website ?? '', onChange: (e) => setDraft((d) => ({ ...d, website: e.target.value })) }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Input, { label: "Pa\u00EDs", value: draft.country ?? '', onChange: (e) => setDraft((d) => ({ ...d, country: e.target.value })) }), _jsx(Input, { label: "Moeda padr\u00E3o", placeholder: "BRL", maxLength: 3, value: draft.currency ?? '', onChange: (e) => setDraft((d) => ({ ...d, currency: e.target.value.toUpperCase() })) })] }), _jsxs("div", { children: [_jsx("span", { className: "field-label", children: "Preferred system maintenance time (UTC)" }), _jsx("select", { value: draft.maintenanceWindowUtc ?? 'No preference', onChange: (e) => setDraft((d) => ({
                            ...d,
                            maintenanceWindowUtc: e.target.value === 'No preference' ? null : e.target.value,
                        })), className: "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200", children: MAINTENANCE_WINDOWS.map((w) => (_jsx("option", { value: w, children: w }, w))) })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { type: "submit", loading: m.isPending, children: "Salvar altera\u00E7\u00F5es" }) })] }));
}
function CurrenciesTab() {
    const q = useQuery({ queryKey: ['settings-org'], queryFn: settingsApi.currentOrg });
    const supported = ['BRL', 'USD', 'EUR', 'GBP', 'ARS', 'MXN', 'CLP', 'COP'];
    const current = q.data?.currency ?? 'BRL';
    return (_jsxs("div", { children: [_jsx("p", { className: "mb-4 text-sm text-muted-foreground", children: "Moedas habilitadas para uso em deals, leads e relat\u00F3rios." }), _jsx("ul", { className: "divide-y divide-border/50 rounded-lg border border-border", children: supported.map((code) => (_jsxs("li", { className: "flex items-center justify-between px-4 py-3 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-bold text-foreground", children: code }), _jsx("span", { className: "ml-2 text-muted-foreground", children: currencyName(code) })] }), current === code ? (_jsx("span", { className: "rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700", children: "Padr\u00E3o" })) : (_jsx("span", { className: "text-xs text-muted-foreground/70", children: "Habilitada" }))] }, code))) })] }));
}
function currencyName(code) {
    return ({
        BRL: 'Real brasileiro',
        USD: 'US Dollar',
        EUR: 'Euro',
        GBP: 'British Pound',
        ARS: 'Peso argentino',
        MXN: 'Peso mexicano',
        CLP: 'Peso chileno',
        COP: 'Peso colombiano',
    }[code] ?? code);
}
function LostReasonsList() {
    const qc = useQueryClient();
    const q = useQuery({ queryKey: ['lost-reasons'], queryFn: lostReasonsApi.list });
    const [name, setName] = useState('');
    const create = useMutation({
        mutationFn: () => lostReasonsApi.create({ name }),
        onSuccess: async () => {
            toast.success('Motivo adicionado.');
            setName('');
            await qc.invalidateQueries({ queryKey: ['lost-reasons'] });
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
    });
    const remove = useMutation({
        mutationFn: (id) => lostReasonsApi.remove(id),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['lost-reasons'] });
        },
    });
    return (_jsxs("div", { children: [_jsx("p", { className: "mb-4 text-sm text-muted-foreground", children: "Quando um deal \u00E9 perdido, o vendedor pode escolher um destes motivos." }), _jsxs("form", { onSubmit: (e) => {
                    e.preventDefault();
                    if (name.trim())
                        create.mutate();
                }, className: "mb-4 flex gap-2", children: [_jsx(Input, { placeholder: "Ex: Pre\u00E7o muito alto", value: name, onChange: (e) => setName(e.target.value) }), _jsx(Button, { type: "submit", loading: create.isPending, children: "Adicionar" })] }), _jsx("ul", { className: "divide-y divide-border/50 rounded-lg border border-border", children: q.data?.length ? (q.data.map((r) => (_jsxs("li", { className: "flex items-center justify-between px-4 py-3 text-sm", children: [_jsx("span", { className: "text-foreground", children: r.name }), _jsx("button", { type: "button", onClick: () => remove.mutate(r.id), className: "text-xs font-semibold text-danger hover:underline", children: "Remover" })] }, r.id)))) : (_jsx("li", { className: "px-4 py-8 text-center text-sm text-muted-foreground", children: "Nenhum motivo cadastrado." })) })] }));
}
function LabelsList() {
    const qc = useQueryClient();
    const q = useQuery({ queryKey: ['labels-all'], queryFn: () => labelsApi.list() });
    const [name, setName] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [entityType, setEntityType] = useState('DEAL');
    const create = useMutation({
        mutationFn: () => labelsApi.create({ name, color, entityType }),
        onSuccess: async () => {
            toast.success('Etiqueta adicionada.');
            setName('');
            await qc.invalidateQueries({ queryKey: ['labels-all'] });
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
    });
    const remove = useMutation({
        mutationFn: (id) => labelsApi.remove(id),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['labels-all'] });
        },
    });
    return (_jsxs("div", { children: [_jsx("p", { className: "mb-4 text-sm text-muted-foreground", children: "Etiquetas servem para classificar deals, contatos e mais." }), _jsxs("form", { onSubmit: (e) => {
                    e.preventDefault();
                    if (name.trim())
                        create.mutate();
                }, className: "mb-4 flex flex-wrap items-end gap-2", children: [_jsx(Input, { placeholder: "Nome", value: name, onChange: (e) => setName(e.target.value) }), _jsx("input", { type: "color", value: color, onChange: (e) => setColor(e.target.value), className: "h-10 w-12 cursor-pointer rounded-lg border border-border" }), _jsxs("select", { value: entityType, onChange: (e) => setEntityType(e.target.value), className: "h-10 rounded-lg border border-border bg-card px-3 text-sm", children: [_jsx("option", { value: "DEAL", children: "Deals" }), _jsx("option", { value: "CONTACT", children: "Contacts" }), _jsx("option", { value: "COMPANY", children: "Companies" }), _jsx("option", { value: "LEAD", children: "Leads" }), _jsx("option", { value: "ACTIVITY", children: "Activities" })] }), _jsx(Button, { type: "submit", loading: create.isPending, children: "Adicionar" })] }), _jsx("ul", { className: "divide-y divide-border/50 rounded-lg border border-border", children: q.data?.length ? (q.data.map((l) => (_jsxs("li", { className: "flex items-center justify-between gap-3 px-4 py-3 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "inline-block h-4 w-4 rounded-full", style: { backgroundColor: l.color } }), _jsx("span", { className: "font-semibold text-foreground", children: l.name }), _jsx("span", { className: "rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground", children: l.entityType })] }), _jsx("button", { type: "button", onClick: () => remove.mutate(l.id), className: "text-xs font-semibold text-danger hover:underline", children: "Remover" })] }, l.id)))) : (_jsx("li", { className: "px-4 py-8 text-center text-sm text-muted-foreground", children: "Nenhuma etiqueta cadastrada." })) })] }));
}
function Placeholder({ title, hint }) {
    return (_jsxs("div", { className: "grid place-items-center rounded-lg border border-dashed border-border p-10 text-center", children: [_jsx("h3", { className: "text-base font-bold text-foreground", children: title }), hint && _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: hint })] }));
}
