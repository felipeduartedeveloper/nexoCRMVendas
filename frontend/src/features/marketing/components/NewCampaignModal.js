import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { marketingApi } from '@/api/marketing.api';
import { extractErrorMessage } from '@/lib/api';
export function NewCampaignModal({ open, onClose }) {
    const qc = useQueryClient();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [fromName, setFromName] = useState('');
    const [fromEmail, setFromEmail] = useState('');
    const [replyToEmail, setReplyToEmail] = useState('');
    const [templateId, setTemplateId] = useState(null);
    const [bodyHtml, setBodyHtml] = useState('');
    const [audienceId, setAudienceId] = useState(null);
    const [scheduledAt, setScheduledAt] = useState('');
    const [error, setError] = useState(null);
    const { data: templates = [] } = useQuery({
        queryKey: ['marketing', 'templates'],
        queryFn: marketingApi.listTemplates,
        enabled: open && step === 2,
    });
    const { data: audiences = [] } = useQuery({
        queryKey: ['marketing', 'audiences'],
        queryFn: marketingApi.listAudiences,
        enabled: open && step === 3,
    });
    const mut = useMutation({
        mutationFn: () => marketingApi.createCampaign({
            name: name.trim(),
            subject: subject.trim(),
            fromName: fromName.trim(),
            fromEmail: fromEmail.trim(),
            replyToEmail: replyToEmail.trim() || null,
            templateId,
            audienceId,
            scheduledAt: scheduledAt || null,
            bodyHtml: bodyHtml || templates.find((t) => t.id === templateId)?.bodyHtml || '',
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['marketing', 'campaigns'] });
            reset();
            onClose();
        },
        onError: (err) => setError(extractErrorMessage(err)),
    });
    function reset() {
        setStep(1);
        setName('');
        setSubject('');
        setFromName('');
        setFromEmail('');
        setReplyToEmail('');
        setTemplateId(null);
        setBodyHtml('');
        setAudienceId(null);
        setScheduledAt('');
        setError(null);
    }
    function onSubmit(e) {
        e.preventDefault();
        if (step < 3) {
            setStep((s) => s + 1);
            return;
        }
        mut.mutate();
    }
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4", children: _jsxs("form", { onSubmit: onSubmit, className: "w-full max-w-2xl rounded-xl bg-card shadow-elevated", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-border p-5", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-bold text-foreground", children: "Nova campanha" }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Passo ", step, " de 3"] })] }), _jsx("button", { type: "button", onClick: onClose, "aria-label": "Fechar", className: "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted", children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "max-h-[60vh] space-y-3 overflow-y-auto p-5", children: [step === 1 && (_jsxs(_Fragment, { children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Nome da campanha *" }), _jsx("input", { required: true, value: name, onChange: (e) => setName(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Assunto do email *" }), _jsx("input", { required: true, value: subject, onChange: (e) => setSubject(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Nome do remetente *" }), _jsx("input", { required: true, value: fromName, onChange: (e) => setFromName(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Email do remetente *" }), _jsx("input", { required: true, type: "email", value: fromEmail, onChange: (e) => setFromEmail(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Reply-To (opcional)" }), _jsx("input", { type: "email", value: replyToEmail, onChange: (e) => setReplyToEmail(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm" })] })] })), step === 2 && (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Escolha um modelo ou crie um email em branco:" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("button", { type: "button", onClick: () => setTemplateId(null), className: `rounded-md border-2 p-3 text-left text-sm ${templateId === null ? 'border-brand-500 bg-brand-50' : 'border-border'}`, children: [_jsx("strong", { children: "Email em branco" }), _jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Come\u00E7ar do zero" })] }), templates.map((t) => (_jsxs("button", { type: "button", onClick: () => setTemplateId(t.id), className: `rounded-md border-2 p-3 text-left text-sm ${templateId === t.id ? 'border-brand-500 bg-brand-50' : 'border-border'}`, children: [_jsx("strong", { children: t.name }), _jsx("p", { className: "mt-1 truncate text-xs text-muted-foreground", children: t.subject })] }, t.id)))] }), templateId === null && (_jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "HTML do email" }), _jsx("textarea", { value: bodyHtml, onChange: (e) => setBodyHtml(e.target.value), rows: 6, placeholder: "<p>Ol\u00E1 {{contact.firstName}}...</p>", className: "w-full rounded-md border border-border px-2 py-1.5 font-mono text-xs" })] }))] })), step === 3 && (_jsxs(_Fragment, { children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Audi\u00EAncia" }), _jsxs("select", { value: audienceId ?? '', onChange: (e) => setAudienceId(e.target.value || null), className: "h-9 w-full rounded-md border border-border px-2 text-sm", children: [_jsx("option", { value: "", children: "\u2014 Selecione \u2014" }), audiences.map((a) => (_jsxs("option", { value: a.id, children: [a.name, " (", a.estimatedSize, " contato", a.estimatedSize !== 1 ? 's' : '', ")"] }, a.id)))] })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: "Agendamento" }), _jsx("input", { type: "datetime-local", value: scheduledAt, onChange: (e) => setScheduledAt(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm" }), _jsx("p", { className: "field-hint", children: "Deixe em branco para criar como rascunho." })] })] })), error && (_jsx("div", { className: "rounded-md border border-danger/30 bg-danger/5 p-2 text-sm text-danger", children: error }))] }), _jsxs("footer", { className: "flex items-center justify-between border-t border-border p-4", children: [_jsx("button", { type: "button", onClick: () => (step > 1 ? setStep((s) => s - 1) : onClose()), className: "h-9 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground/80 hover:bg-muted/40", children: step > 1 ? 'Voltar' : 'Cancelar' }), _jsx("button", { type: "submit", disabled: mut.isPending, className: "h-9 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50", children: step < 3 ? 'Próximo' : mut.isPending ? 'Criando...' : 'Criar campanha' })] })] }) }));
}
