import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldX } from 'lucide-react';
import { marketingApi } from '@/api/marketing.api';
export function MarketingSettingsPage() {
    const qc = useQueryClient();
    const { data } = useQuery({
        queryKey: ['marketing', 'settings'],
        queryFn: marketingApi.getSettings,
    });
    const [senderDomain, setSenderDomain] = useState('');
    const [senderName, setSenderName] = useState('');
    const [defaultReplyTo, setDefaultReplyTo] = useState('');
    const [signatureHtml, setSignatureHtml] = useState('');
    useEffect(() => {
        if (data) {
            setSenderDomain(data.senderDomain ?? '');
            setSenderName(data.senderName ?? '');
            setDefaultReplyTo(data.defaultReplyTo ?? '');
            setSignatureHtml(data.signatureHtml ?? '');
        }
    }, [data?.id]);
    const mut = useMutation({
        mutationFn: () => marketingApi.updateSettings({
            senderDomain: senderDomain || null,
            senderName: senderName || null,
            defaultReplyTo: defaultReplyTo || null,
            signatureHtml: signatureHtml || null,
        }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'settings'] }),
    });
    return (_jsxs("div", { className: "flex h-full flex-col", children: [_jsxs("header", { className: "border-b border-border px-6 py-4", children: [_jsx("h1", { className: "text-xl font-bold text-foreground", children: "Dom\u00EDnio e envio" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Configure remetente padr\u00E3o e verifique autentica\u00E7\u00E3o DKIM/SPF." })] }), _jsxs("div", { className: "flex-1 space-y-4 overflow-auto p-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Dom\u00EDnio do remetente" }), _jsx("input", { value: senderDomain, onChange: (e) => setSenderDomain(e.target.value), placeholder: "empresa.com.br", className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Nome padr\u00E3o" }), _jsx("input", { value: senderName, onChange: (e) => setSenderName(e.target.value), placeholder: "Equipe Vendas", className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("label", { className: "block col-span-2", children: [_jsx("span", { className: "field-label", children: "Email padr\u00E3o de reply-to" }), _jsx("input", { type: "email", value: defaultReplyTo, onChange: (e) => setDefaultReplyTo(e.target.value), placeholder: "contato@empresa.com.br", className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("label", { className: "block col-span-2", children: [_jsx("span", { className: "field-label", children: "Assinatura (HTML)" }), _jsx("textarea", { value: signatureHtml, onChange: (e) => setSignatureHtml(e.target.value), rows: 4, className: "w-full rounded-md border border-border px-2 py-1.5 font-mono text-xs" })] })] }), _jsxs("div", { children: [_jsx("p", { className: "field-label", children: "Autentica\u00E7\u00E3o do remetente" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx(StatusBadge, { label: "DKIM", verified: !!data?.dkimVerified }), _jsx(StatusBadge, { label: "SPF", verified: !!data?.spfVerified })] }), _jsx("p", { className: "field-hint", children: "Configure registros DNS no seu provedor pra autenticar o dom\u00EDnio." })] }), data?.unsubscribeUrl && (_jsxs("div", { className: "rounded-md border border-border bg-muted/40 p-3", children: [_jsx("p", { className: "text-xs font-semibold text-muted-foreground", children: "URL p\u00FAblica de unsubscribe" }), _jsx("code", { className: "mt-1 block text-xs text-foreground", children: data.unsubscribeUrl })] })), _jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "button", onClick: () => mut.mutate(), disabled: mut.isPending, className: "h-9 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50", children: mut.isPending ? 'Salvando...' : 'Salvar' }) })] })] }));
}
function StatusBadge({ label, verified }) {
    return (_jsxs("div", { className: `flex items-center gap-2 rounded-md border p-3 ${verified ? 'border-success/30 bg-success/5' : 'border-border bg-muted/40'}`, children: [verified ? (_jsx(ShieldCheck, { className: "h-5 w-5 text-success" })) : (_jsx(ShieldX, { className: "h-5 w-5 text-muted-foreground/70" })), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-foreground", children: label }), _jsx("p", { className: "text-xs text-muted-foreground", children: verified ? 'Verificado' : 'Não configurado' })] })] }));
}
