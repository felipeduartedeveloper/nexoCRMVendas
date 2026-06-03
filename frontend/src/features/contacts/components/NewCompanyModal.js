import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { companiesApi } from '@/api/contacts.api';
import { extractErrorMessage } from '@/lib/api';
export function NewCompanyModal({ open, onClose }) {
    const qc = useQueryClient();
    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [industry, setIndustry] = useState('');
    const [phone, setPhone] = useState('');
    const m = useMutation({
        mutationFn: () => companiesApi.create({
            name,
            website: website || undefined,
            industry: industry || undefined,
            phone: phone || undefined,
        }),
        onSuccess: async () => {
            toast.success('Empresa criada!');
            await qc.invalidateQueries({ queryKey: ['companies'] });
            reset();
            onClose();
        },
        onError: (err) => toast.error(extractErrorMessage(err, 'Falha ao criar.')),
    });
    function reset() {
        setName('');
        setWebsite('');
        setIndustry('');
        setPhone('');
    }
    function onSubmit(e) {
        e.preventDefault();
        if (!name.trim())
            return toast.error('Informe o nome.');
        m.mutate();
    }
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-xl bg-card shadow-elevated", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-border p-5", children: [_jsx("h3", { className: "text-lg font-bold text-foreground", children: "Nova empresa" }), _jsx("button", { type: "button", onClick: onClose, className: "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted", "aria-label": "Fechar", children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsxs("form", { onSubmit: onSubmit, className: "space-y-4 p-5", children: [_jsx(Input, { label: "Nome", value: name, onChange: (e) => setName(e.target.value), autoFocus: true, required: true }), _jsx(Input, { label: "Site", value: website, placeholder: "https://exemplo.com.br", onChange: (e) => setWebsite(e.target.value) }), _jsx(Input, { label: "Setor", value: industry, onChange: (e) => setIndustry(e.target.value) }), _jsx(Input, { label: "Telefone", value: phone, onChange: (e) => setPhone(e.target.value) }), _jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [_jsx(Button, { variant: "ghost", type: "button", onClick: onClose, disabled: m.isPending, children: "Cancelar" }), _jsx(Button, { type: "submit", loading: m.isPending, children: "Criar empresa" })] })] })] }) }));
}
