import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trash2, Mail, Phone, Briefcase, StickyNote, Activity as ActivityIcon } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Input } from '@/components/ui/Input';
import { contactsApi } from '@/api/contacts.api';
import { activitiesApi } from '@/api/activities.api';
import { extractErrorMessage } from '@/lib/api';
import { initials } from '@/lib/format';
import { cn } from '@/lib/cn';
export function ContactDetailDrawer({ open, contactId, onClose }) {
    const qc = useQueryClient();
    const [tab, setTab] = useState('overview');
    const q = useQuery({
        queryKey: ['contact', contactId],
        queryFn: () => contactsApi.one(contactId),
        enabled: open && !!contactId,
    });
    const activitiesQ = useQuery({
        queryKey: ['contact-activities', contactId],
        queryFn: () => activitiesApi.list({ contactId: contactId, limit: 50 }),
        enabled: open && !!contactId && tab === 'activities',
    });
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    useEffect(() => {
        if (q.data) {
            setName(q.data.name);
            setEmail(q.data.email ?? '');
            setPhone(q.data.phone ?? '');
            setJobTitle(q.data.jobTitle ?? '');
        }
    }, [q.data?.id]);
    const update = useMutation({
        mutationFn: (data) => contactsApi.update(contactId, data),
        onSuccess: async () => {
            toast.success('Salvo!');
            await qc.invalidateQueries({ queryKey: ['contact', contactId] });
            await qc.invalidateQueries({ queryKey: ['contacts'] });
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
    });
    const remove = useMutation({
        mutationFn: () => contactsApi.remove(contactId),
        onSuccess: async () => {
            toast.success('Contato removido.');
            onClose();
            await qc.invalidateQueries({ queryKey: ['contacts'] });
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
    });
    const c = q.data;
    return (_jsx(Drawer, { open: open, onClose: onClose, width: "lg", title: c ? (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700", children: initials(c.name) }), _jsx("span", { className: "truncate text-lg font-bold text-foreground", children: c.name })] })) : ('Carregando…'), subtitle: c?.jobTitle && _jsx("span", { children: c.jobTitle }), headerActions: c && (_jsx("button", { type: "button", onClick: () => {
                if (window.confirm('Apagar este contato?'))
                    remove.mutate();
            }, className: "grid h-8 w-8 place-items-center rounded-lg text-danger hover:bg-danger/10", "aria-label": "Apagar", children: _jsx(Trash2, { className: "h-4 w-4" }) })), children: !c ? (_jsx("div", { className: "p-8 text-center text-sm text-muted-foreground", children: "Carregando\u2026" })) : (_jsxs("div", { children: [_jsx("nav", { className: "flex border-b border-border", role: "tablist", children: [
                        { value: 'overview', label: 'Visão geral' },
                        { value: 'activities', label: 'Atividades' },
                        { value: 'notes', label: 'Notas' },
                    ].map((t) => (_jsx("button", { role: "tab", onClick: () => setTab(t.value), className: cn('flex-1 border-b-2 px-4 py-3 text-sm font-semibold transition-colors', tab === t.value
                            ? 'border-brand-600 text-brand-700'
                            : 'border-transparent text-muted-foreground hover:text-foreground'), children: t.label }, t.value))) }), tab === 'overview' && (_jsxs("div", { className: "space-y-4 p-5", children: [_jsx(Input, { label: "Nome", value: name, onChange: (e) => setName(e.target.value), onBlur: () => name !== c.name && name && update.mutate({ name }) }), _jsx(Input, { label: "E-mail", type: "email", value: email, onChange: (e) => setEmail(e.target.value), onBlur: () => (email || null) !== (c.email || null) && update.mutate({ email: email || null }), leftSlot: _jsx(Mail, { className: "h-4 w-4" }) }), _jsx(Input, { label: "Telefone", value: phone, onChange: (e) => setPhone(e.target.value), onBlur: () => (phone || null) !== (c.phone || null) && update.mutate({ phone: phone || null }), leftSlot: _jsx(Phone, { className: "h-4 w-4" }) }), _jsx(Input, { label: "Cargo", value: jobTitle, onChange: (e) => setJobTitle(e.target.value), onBlur: () => (jobTitle || null) !== (c.jobTitle || null) &&
                                update.mutate({ jobTitle: jobTitle || null }), leftSlot: _jsx(Briefcase, { className: "h-4 w-4" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-3 text-xs text-muted-foreground", children: [_jsxs("div", { children: ["Criado em ", new Date(c.createdAt).toLocaleString('pt-BR')] }), _jsxs("div", { children: ["Atualizado em ", new Date(c.updatedAt).toLocaleString('pt-BR')] })] })] })), tab === 'activities' && (_jsx("div", { className: "p-5", children: activitiesQ.isLoading ? (_jsx("div", { className: "text-sm text-muted-foreground", children: "Carregando atividades\u2026" })) : !activitiesQ.data?.items?.length ? (_jsxs("div", { className: "grid place-items-center py-10 text-center", children: [_jsx(ActivityIcon, { className: "h-8 w-8 text-muted-foreground/50" }), _jsx("p", { className: "mt-2 text-sm font-semibold text-foreground", children: "Sem atividades" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Crie atividades relacionadas a este contato." })] })) : (_jsx("ul", { className: "space-y-2", children: activitiesQ.data.items.map((a) => (_jsxs("li", { className: "rounded-lg border border-border p-3 text-sm", children: [_jsx("div", { className: cn('font-semibold text-foreground', a.done && 'text-muted-foreground/70 line-through'), children: a.subject }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [a.dueAt ? new Date(a.dueAt).toLocaleString('pt-BR') : 'sem prazo', " \u00B7", ' ', a.type] })] }, a.id))) })) })), tab === 'notes' && (_jsxs("div", { className: "grid place-items-center p-10 text-center", children: [_jsx(StickyNote, { className: "h-8 w-8 text-muted-foreground/50" }), _jsx("p", { className: "mt-2 text-sm font-semibold text-foreground", children: "Notas em breve" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Hist\u00F3rico de anota\u00E7\u00F5es livres por contato chega no pr\u00F3ximo sprint." })] }))] })) }));
}
