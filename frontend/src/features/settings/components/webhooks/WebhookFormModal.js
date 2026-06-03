import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, X } from 'lucide-react';
import { ENTITY_LABELS, groupEvents, webhooksApi, } from '@/api/webhooks.api';
import { extractErrorMessage } from '@/lib/api';
export function WebhookFormModal({ open, onClose, editing }) {
    const qc = useQueryClient();
    const isNew = !editing;
    const [name, setName] = useState(editing?.name ?? '');
    const [targetUrl, setTargetUrl] = useState(editing?.targetUrl ?? '');
    const [events, setEvents] = useState(editing?.events ?? []);
    const [error, setError] = useState(null);
    const [createdSecret, setCreatedSecret] = useState(null);
    const { data: allEvents = [] } = useQuery({
        queryKey: ['webhooks', 'events'],
        queryFn: webhooksApi.events,
        enabled: open,
    });
    useEffect(() => {
        if (open) {
            setName(editing?.name ?? '');
            setTargetUrl(editing?.targetUrl ?? '');
            setEvents(editing?.events ?? []);
            setError(null);
            setCreatedSecret(null);
        }
    }, [open, editing?.id]);
    const grouped = groupEvents(allEvents);
    const createMut = useMutation({
        mutationFn: () => webhooksApi.create({
            targetUrl: targetUrl.trim(),
            events,
            name: name.trim() || undefined,
        }),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['webhooks'] });
            setCreatedSecret(data.secret);
        },
        onError: (err) => setError(extractErrorMessage(err)),
    });
    const updateMut = useMutation({
        mutationFn: () => webhooksApi.update(editing.id, {
            name: name.trim() || null,
            targetUrl: targetUrl.trim(),
            events,
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['webhooks'] });
            onClose();
        },
        onError: (err) => setError(extractErrorMessage(err)),
    });
    function toggleEvent(ev) {
        setEvents((curr) => curr.includes(ev) ? curr.filter((e) => e !== ev) : [...curr, ev]);
    }
    function toggleEntity(entityEvents) {
        const allOn = entityEvents.every((e) => events.includes(e));
        if (allOn)
            setEvents(events.filter((e) => !entityEvents.includes(e)));
        else
            setEvents([...new Set([...events, ...entityEvents])]);
    }
    function onSubmit(e) {
        e.preventDefault();
        if (events.length === 0) {
            setError('Selecione ao menos um evento.');
            return;
        }
        setError(null);
        if (isNew)
            createMut.mutate();
        else
            updateMut.mutate();
    }
    if (!open)
        return null;
    if (createdSecret) {
        return (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4", children: _jsxs("div", { className: "w-full max-w-lg rounded-xl bg-card shadow-elevated", children: [_jsx("header", { className: "border-b border-border p-5", children: _jsx("h2", { className: "text-lg font-bold text-success", children: "Webhook criado com sucesso" }) }), _jsxs("div", { className: "space-y-3 p-5", children: [_jsxs("div", { className: "rounded-md border border-warning/30 bg-warning/5 p-3 text-sm text-foreground/80", children: ["\u26A0\uFE0F ", _jsx("strong", { children: "Copie o secret agora!" }), " Por seguran\u00E7a, ele n\u00E3o ser\u00E1 mostrado novamente. Voc\u00EA pode regenerar depois, mas todos os webhooks j\u00E1 configurados parar\u00E3o de validar."] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Secret HMAC" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("code", { className: "flex-1 break-all rounded-md border border-border bg-muted/40 px-2 py-1.5 font-mono text-xs", children: createdSecret }), _jsxs("button", { type: "button", onClick: () => navigator.clipboard.writeText(createdSecret), className: "inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 text-xs font-medium text-foreground/80 hover:bg-muted/40", children: [_jsx(Copy, { className: "h-3.5 w-3.5" }), " Copiar"] })] })] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Use esse valor pra verificar o header ", _jsx("code", { children: "X-Nexo-Signature" }), " em cada webhook recebido: ", _jsx("code", { children: "sha256=HMAC(secret, body)" }), "."] })] }), _jsx("footer", { className: "flex justify-end border-t border-border p-4", children: _jsx("button", { type: "button", onClick: () => {
                                setCreatedSecret(null);
                                onClose();
                            }, className: "h-9 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700", children: "Conclu\u00EDdo" }) })] }) }));
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4", children: _jsxs("form", { onSubmit: onSubmit, className: "w-full max-w-2xl rounded-xl bg-card shadow-elevated", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-border p-5", children: [_jsx("h2", { className: "text-lg font-bold text-foreground", children: isNew ? 'Novo webhook' : 'Editar webhook' }), _jsx("button", { type: "button", onClick: onClose, "aria-label": "Fechar", className: "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted", children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "max-h-[60vh] space-y-3 overflow-y-auto p-5", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "URL alvo *" }), _jsx("input", { required: true, type: "url", value: targetUrl, onChange: (e) => setTargetUrl(e.target.value), placeholder: "https://api.exemplo.com.br/webhooks/oxlify", className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Nome (opcional)" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "Default: host da URL", className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("div", { children: [_jsx("span", { className: "field-label", children: "Eventos assinados *" }), _jsx("div", { className: "space-y-3", children: Object.entries(grouped).map(([entity, evList]) => {
                                        const allOn = evList.every((e) => events.includes(e));
                                        return (_jsxs("div", { className: "rounded-md border border-border p-3", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between", children: [_jsx("h4", { className: "text-sm font-semibold text-foreground", children: ENTITY_LABELS[entity] ?? entity }), _jsx("button", { type: "button", onClick: () => toggleEntity(evList), className: "text-xs font-semibold text-brand-700 hover:underline", children: allOn ? 'Desmarcar todos' : 'Marcar todos' })] }), _jsx("div", { className: "grid grid-cols-2 gap-1", children: evList.map((ev) => (_jsxs("label", { className: "flex items-center gap-2 text-xs", children: [_jsx("input", { type: "checkbox", checked: events.includes(ev), onChange: () => toggleEvent(ev), className: "h-3.5 w-3.5 rounded border-border text-brand-600" }), _jsx("code", { className: "text-foreground/80", children: ev })] }, ev))) })] }, entity));
                                    }) })] }), error && (_jsx("div", { className: "rounded-md border border-danger/30 bg-danger/5 p-2 text-sm text-danger", children: error }))] }), _jsxs("footer", { className: "flex items-center justify-end gap-2 border-t border-border p-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "h-9 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground/80 hover:bg-muted/40", children: "Cancelar" }), _jsx("button", { type: "submit", disabled: createMut.isPending || updateMut.isPending, className: "h-9 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50", children: createMut.isPending || updateMut.isPending ? 'Salvando...' : isNew ? 'Criar' : 'Salvar' })] })] }) }));
}
