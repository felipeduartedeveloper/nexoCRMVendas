import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { api, unwrap } from '@/lib/api';
export function ContactsPage() {
    const q = useQuery({
        queryKey: ['contacts', 'list'],
        queryFn: async () => unwrap(await api.get('/contacts', { params: { page: 1, limit: 50 } })),
    });
    return (_jsxs("div", { className: "mx-auto max-w-7xl", children: [_jsx(PageHeader, { title: "Contatos", subtitle: "Pessoas com quem voc\u00EA est\u00E1 construindo relacionamento.", actions: _jsxs(Button, { children: [_jsx(Plus, { className: "h-4 w-4" }), " Novo contato"] }) }), _jsxs("div", { className: "rounded-xl border border-border bg-card shadow-card", children: [_jsxs("div", { className: "flex items-center gap-3 border-b border-border p-4", children: [_jsxs("div", { className: "relative flex w-full max-w-sm items-center", children: [_jsx(Search, { className: "pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground/70" }), _jsx("input", { placeholder: "Buscar por nome, e-mail\u2026", className: "h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" })] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Filter, { className: "h-4 w-4" }), " Filtros"] })] }), q.isLoading ? (_jsx("div", { className: "flex h-48 items-center justify-center", children: _jsx(Spinner, { label: "Carregando contatos\u2026" }) })) : !q.data?.items?.length ? (_jsx("div", { className: "grid place-items-center p-12 text-center text-sm text-muted-foreground", children: "Nenhum contato ainda." })) : (_jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border/50 bg-muted/40 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground", children: [_jsx("th", { className: "px-4 py-3", children: "Nome" }), _jsx("th", { className: "px-4 py-3", children: "E-mail" }), _jsx("th", { className: "px-4 py-3", children: "Telefone" }), _jsx("th", { className: "px-4 py-3", children: "Empresa" })] }) }), _jsx("tbody", { children: q.data.items.map((c) => (_jsxs("tr", { className: "border-b border-border/50 hover:bg-brand-50/40", children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700", children: c.name
                                                            .split(' ')
                                                            .map((w) => w[0])
                                                            .slice(0, 2)
                                                            .join('')
                                                            .toUpperCase() }), _jsx("span", { className: "font-semibold text-foreground", children: c.name })] }) }), _jsx("td", { className: "px-4 py-3 text-foreground/80", children: c.email ?? '—' }), _jsx("td", { className: "px-4 py-3 text-foreground/80", children: c.phone ?? '—' }), _jsx("td", { className: "px-4 py-3", children: c.companyName ? (_jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/80", children: [_jsx(Building2, { className: "h-3 w-3" }), " ", c.companyName] })) : ('—') })] }, c.id))) })] }))] })] }));
}
