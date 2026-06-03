import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { dealsApi } from '@/api/deals.api';
import { extractErrorMessage } from '@/lib/api';
export function NewDealModal({ open, pipeline, defaultStage, onClose }) {
    const qc = useQueryClient();
    const [title, setTitle] = useState('');
    const [value, setValue] = useState('');
    const [stageId, setStageId] = useState(defaultStage.id);
    const m = useMutation({
        mutationFn: () => dealsApi.create({
            title,
            pipelineId: pipeline.id,
            stageId,
            value: value ? Number(value) : 0,
            currency: pipeline.currency,
        }),
        onSuccess: async () => {
            toast.success('Negócio criado!');
            await qc.invalidateQueries({ queryKey: ['deals'] });
            await qc.invalidateQueries({ queryKey: ['deals-summary', pipeline.id] });
            reset();
            onClose();
        },
        onError: (err) => toast.error(extractErrorMessage(err, 'Falha ao criar.')),
    });
    function reset() {
        setTitle('');
        setValue('');
        setStageId(defaultStage.id);
    }
    function onSubmit(e) {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Informe um título.');
            return;
        }
        m.mutate();
    }
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-xl bg-card shadow-elevated", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-border p-5", children: [_jsx("h3", { className: "text-lg font-bold text-foreground", children: "Novo neg\u00F3cio" }), _jsx("button", { type: "button", onClick: onClose, className: "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted", "aria-label": "Fechar", children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsxs("form", { onSubmit: onSubmit, className: "space-y-4 p-5", children: [_jsx(Input, { label: "T\u00EDtulo", placeholder: "Ex: Proposta site institucional", value: title, onChange: (e) => setTitle(e.target.value), autoFocus: true, required: true }), _jsx(Input, { label: `Valor (${pipeline.currency})`, type: "number", min: 0, value: value, onChange: (e) => setValue(e.target.value), placeholder: "0" }), _jsxs("div", { children: [_jsx("span", { className: "field-label", children: "Etapa" }), _jsx("select", { value: stageId, onChange: (e) => setStageId(e.target.value), className: "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200", children: pipeline.stages.map((s) => (_jsx("option", { value: s.id, children: s.name }, s.id))) })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [_jsx(Button, { variant: "ghost", type: "button", onClick: onClose, disabled: m.isPending, children: "Cancelar" }), _jsx(Button, { type: "submit", loading: m.isPending, children: "Criar neg\u00F3cio" })] })] })] }) }));
}
