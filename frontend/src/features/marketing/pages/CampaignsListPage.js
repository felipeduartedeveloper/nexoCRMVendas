import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Pause, Play, Plus, Send, Trash2 } from 'lucide-react';
import { CAMPAIGN_STATUS_LABELS, marketingApi, } from '@/api/marketing.api';
import { NewCampaignModal } from '../components/NewCampaignModal';
const STATUS_COLORS = {
    DRAFT: 'bg-muted text-foreground/80',
    SCHEDULED: 'bg-brand-50 text-brand-700',
    SENDING: 'bg-warning/10 text-warning',
    SENT: 'bg-success/10 text-success',
    PAUSED: 'bg-muted text-muted-foreground',
    FAILED: 'bg-danger/10 text-danger',
};
export function CampaignsListPage() {
    const qc = useQueryClient();
    const [openNew, setOpenNew] = useState(false);
    const [status, setStatus] = useState('');
    const { data = [], isLoading } = useQuery({
        queryKey: ['marketing', 'campaigns', status],
        queryFn: () => marketingApi.listCampaigns((status || undefined)),
    });
    const sendMut = useMutation({
        mutationFn: (id) => marketingApi.sendCampaignNow(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'campaigns'] }),
    });
    const pauseMut = useMutation({
        mutationFn: (id) => marketingApi.pauseCampaign(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'campaigns'] }),
    });
    const deleteMut = useMutation({
        mutationFn: (id) => marketingApi.deleteCampaign(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'campaigns'] }),
    });
    return (_jsxs("div", { className: "flex h-full flex-col", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-foreground", children: "Campanhas" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Crie, agende e acompanhe suas campanhas de email." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "h-9 rounded-md border border-border bg-card px-2 text-sm", children: [_jsx("option", { value: "", children: "Todas" }), Object.entries(CAMPAIGN_STATUS_LABELS).map(([k, v]) => (_jsx("option", { value: k, children: v }, k)))] }), _jsxs("button", { type: "button", onClick: () => setOpenNew(true), className: "inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700", children: [_jsx(Plus, { className: "h-4 w-4" }), "Nova campanha"] })] })] }), _jsxs("div", { className: "flex-1 overflow-auto", children: [isLoading && _jsx("div", { className: "p-8 text-sm text-muted-foreground", children: "Carregando..." }), !isLoading && data.length === 0 && (_jsxs("div", { className: "grid place-items-center p-16 text-center", children: [_jsx(Megaphone, { className: "h-12 w-12 text-muted-foreground/50" }), _jsx("h2", { className: "mt-3 text-base font-semibold text-foreground", children: "Sua primeira campanha come\u00E7a aqui" }), _jsx("p", { className: "mt-1 max-w-sm text-sm text-muted-foreground", children: "Crie campanhas de email para reativar contatos, anunciar promo\u00E7\u00F5es ou nutrir leads." }), _jsxs("button", { type: "button", onClick: () => setOpenNew(true), className: "mt-4 inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700", children: [_jsx(Plus, { className: "h-4 w-4" }), " Nova campanha"] })] })), !isLoading && data.length > 0 && (_jsxs("table", { className: "min-w-full divide-y divide-border text-sm", children: [_jsx("thead", { className: "bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: _jsxs("tr", { children: [_jsx("th", { className: "px-3 py-2 text-left", children: "Status" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Nome" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Assunto" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Audi\u00EAncia" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Enviados" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Abertura" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Cliques" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Quando" }), _jsx("th", { className: "px-3 py-2 text-left", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "divide-y divide-border bg-card", children: data.map((c) => {
                                    const opens = c.metrics.sent > 0
                                        ? Math.round((c.metrics.uniqueOpens / c.metrics.sent) * 100)
                                        : 0;
                                    const clicks = c.metrics.sent > 0
                                        ? Math.round((c.metrics.uniqueClicks / c.metrics.sent) * 100)
                                        : 0;
                                    return (_jsxs("tr", { className: "hover:bg-muted/40", children: [_jsx("td", { className: "px-3 py-2.5", children: _jsx("span", { className: `inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[c.status]}`, children: CAMPAIGN_STATUS_LABELS[c.status] }) }), _jsx("td", { className: "px-3 py-2.5 font-medium text-foreground", children: c.name }), _jsx("td", { className: "px-3 py-2.5 text-foreground/80", children: c.subject }), _jsx("td", { className: "px-3 py-2.5 text-foreground/80", children: c.metrics.audienceSize }), _jsx("td", { className: "px-3 py-2.5 text-foreground/80", children: c.metrics.sent }), _jsxs("td", { className: "px-3 py-2.5 text-foreground/80", children: [opens, "%"] }), _jsxs("td", { className: "px-3 py-2.5 text-foreground/80", children: [clicks, "%"] }), _jsx("td", { className: "px-3 py-2.5 text-muted-foreground", children: c.sentAt
                                                    ? new Date(c.sentAt).toLocaleString('pt-BR')
                                                    : c.scheduledAt
                                                        ? `Agendada: ${new Date(c.scheduledAt).toLocaleString('pt-BR')}`
                                                        : 'Rascunho' }), _jsx("td", { className: "px-3 py-2.5", children: _jsxs("div", { className: "flex items-center gap-1", children: [(c.status === 'DRAFT' || c.status === 'SCHEDULED') && (_jsx("button", { type: "button", onClick: () => sendMut.mutate(c.id), title: "Enviar agora", className: "grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-brand-50 hover:text-brand-700", children: _jsx(Send, { className: "h-3.5 w-3.5" }) })), c.status === 'SCHEDULED' && (_jsx("button", { type: "button", onClick: () => pauseMut.mutate(c.id), title: "Pausar", className: "grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted", children: _jsx(Pause, { className: "h-3.5 w-3.5" }) })), c.status === 'PAUSED' && (_jsx("button", { type: "button", onClick: () => sendMut.mutate(c.id), title: "Retomar", className: "grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted", children: _jsx(Play, { className: "h-3.5 w-3.5" }) })), _jsx("button", { type: "button", onClick: () => {
                                                                if (confirm('Apagar campanha?'))
                                                                    deleteMut.mutate(c.id);
                                                            }, title: "Apagar", className: "grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-danger", children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) })] }) })] }, c.id));
                                }) })] }))] }), _jsx(NewCampaignModal, { open: openNew, onClose: () => setOpenNew(false) })] }));
}
