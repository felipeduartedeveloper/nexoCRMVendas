import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pause, Play, Plus, RefreshCw, Send, Trash2, Webhook as WebhookIcon } from 'lucide-react';
import { webhooksApi } from '@/api/webhooks.api';
import { WebhookFormModal } from '../components/webhooks/WebhookFormModal';
import { DeliveriesDrawer } from '../components/webhooks/DeliveriesDrawer';
const STATUS_LABELS = {
    ACTIVE: 'Ativo',
    PAUSED: 'Pausado',
    FAILING: 'Falhando',
};
const STATUS_COLORS = {
    ACTIVE: 'bg-success/10 text-success',
    PAUSED: 'bg-muted text-muted-foreground',
    FAILING: 'bg-danger/10 text-danger',
};
export function WebhooksPage() {
    const qc = useQueryClient();
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deliveriesOf, setDeliveriesOf] = useState(null);
    const { data = [], isLoading } = useQuery({
        queryKey: ['webhooks'],
        queryFn: webhooksApi.list,
    });
    const setStatusMut = useMutation({
        mutationFn: ({ id, status }) => webhooksApi.setStatus(id, status),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
    });
    const testMut = useMutation({
        mutationFn: (id) => webhooksApi.test(id),
        onSuccess: (res) => {
            alert(`Teste enviado. Status: ${res.statusCode ?? 'erro'} · ${res.latencyMs ?? '?'}ms`);
            qc.invalidateQueries({ queryKey: ['webhooks'] });
        },
    });
    const deleteMut = useMutation({
        mutationFn: (id) => webhooksApi.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
    });
    const regenerateMut = useMutation({
        mutationFn: (id) => webhooksApi.regenerateSecret(id),
        onSuccess: (data) => {
            alert(`Novo secret: ${data.secret}\n\n⚠️ Guarde agora, não mostraremos novamente.`);
            qc.invalidateQueries({ queryKey: ['webhooks'] });
        },
    });
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-foreground", children: "Webhooks" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Receba notifica\u00E7\u00F5es HTTP em tempo real quando dados mudam no oxlify." })] }), _jsxs("button", { type: "button", onClick: () => {
                            setEditing(null);
                            setFormOpen(true);
                        }, className: "inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700", children: [_jsx(Plus, { className: "h-4 w-4" }), "Novo webhook"] })] }), isLoading && _jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando..." }), !isLoading && data.length === 0 && (_jsxs("div", { className: "grid place-items-center rounded-lg border border-dashed border-border p-12 text-center", children: [_jsx(WebhookIcon, { className: "h-10 w-10 text-muted-foreground/50" }), _jsx("h2", { className: "mt-3 text-base font-semibold text-foreground", children: "Sem webhooks configurados" }), _jsx("p", { className: "mt-1 max-w-md text-sm text-muted-foreground", children: "Configure URLs externas pra receber eventos quando deals, pessoas, atividades ou leads mudarem. Cada payload \u00E9 assinado com HMAC SHA-256." })] })), data.length > 0 && (_jsx("div", { className: "overflow-hidden rounded-lg border border-border", children: _jsxs("table", { className: "min-w-full divide-y divide-border text-sm", children: [_jsx("thead", { className: "bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: _jsxs("tr", { children: [_jsx("th", { className: "px-3 py-2 text-left", children: "Status" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Nome / URL" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Eventos" }), _jsx("th", { className: "px-3 py-2 text-left", children: "\u00DAltima entrega" }), _jsx("th", { className: "px-3 py-2 text-left", children: "C\u00F3digo" }), _jsx("th", { className: "px-3 py-2 text-left", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "divide-y divide-border bg-card", children: data.map((w) => (_jsxs("tr", { className: "hover:bg-muted/40", children: [_jsx("td", { className: "px-3 py-2.5", children: _jsx("span", { className: `inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[w.status]}`, children: STATUS_LABELS[w.status] }) }), _jsxs("td", { className: "px-3 py-2.5", children: [_jsx("div", { className: "font-medium text-foreground", children: w.name ?? '(sem nome)' }), _jsx("code", { className: "block max-w-xs truncate text-[11px] text-muted-foreground", children: w.targetUrl })] }), _jsx("td", { className: "px-3 py-2.5", children: _jsxs("span", { className: "inline-block cursor-help rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-foreground/80", title: w.events.join('\n'), children: [w.events.length, " evento(s)"] }) }), _jsx("td", { className: "px-3 py-2.5 text-foreground/80", children: w.lastDeliveryAt
                                            ? formatRelative(w.lastDeliveryAt)
                                            : _jsx("span", { className: "text-muted-foreground/70", children: "\u2014" }) }), _jsx("td", { className: "px-3 py-2.5 text-foreground/80", children: w.lastStatusCode ?? _jsx("span", { className: "text-muted-foreground/70", children: "\u2014" }) }), _jsx("td", { className: "px-3 py-2.5", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { type: "button", onClick: () => testMut.mutate(w.id), title: "Testar", className: "grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted", children: _jsx(Send, { className: "h-3.5 w-3.5" }) }), _jsx("button", { type: "button", onClick: () => setDeliveriesOf(w.id), title: "Ver entregas", className: "grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted", children: _jsx(Eye, { className: "h-3.5 w-3.5" }) }), _jsx("button", { type: "button", onClick: () => {
                                                        setEditing(w);
                                                        setFormOpen(true);
                                                    }, className: "rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground/80 hover:bg-muted/40", children: "Editar" }), _jsx("button", { type: "button", onClick: () => setStatusMut.mutate({
                                                        id: w.id,
                                                        status: w.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED',
                                                    }), title: w.status === 'PAUSED' ? 'Ativar' : 'Pausar', className: "grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted", children: w.status === 'PAUSED' ? (_jsx(Play, { className: "h-3.5 w-3.5" })) : (_jsx(Pause, { className: "h-3.5 w-3.5" })) }), _jsx("button", { type: "button", onClick: () => {
                                                        if (confirm('Gerar novo secret? Os clientes precisarão ser reconfigurados.'))
                                                            regenerateMut.mutate(w.id);
                                                    }, title: "Regenerar secret", className: "grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted", children: _jsx(RefreshCw, { className: "h-3.5 w-3.5" }) }), _jsx("button", { type: "button", onClick: () => {
                                                        if (confirm('Apagar webhook?'))
                                                            deleteMut.mutate(w.id);
                                                    }, title: "Apagar", className: "grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-danger", children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) })] }) })] }, w.id))) })] }) })), _jsx(WebhookFormModal, { open: formOpen, onClose: () => {
                    setFormOpen(false);
                    setEditing(null);
                }, editing: editing }), _jsx(DeliveriesDrawer, { webhookId: deliveriesOf, open: deliveriesOf !== null, onClose: () => setDeliveriesOf(null) })] }));
}
function formatRelative(iso) {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000)
        return 'agora há pouco';
    if (diff < 3_600_000)
        return `há ${Math.floor(diff / 60_000)}min`;
    if (diff < 86_400_000)
        return `há ${Math.floor(diff / 3_600_000)}h`;
    return d.toLocaleDateString('pt-BR');
}
