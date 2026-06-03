import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/api/auth.api';
import { extractErrorMessage } from '@/lib/api';
export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const m = useMutation({
        mutationFn: authApi.forgotPassword,
        onSuccess: () => setSent(true),
        onError: (err) => toast.error(extractErrorMessage(err, 'Não foi possível enviar o link.')),
    });
    function onSubmit(e) {
        e.preventDefault();
        if (!email)
            return;
        m.mutate(email);
    }
    return (_jsx(AuthLayout, { title: "Recuperar senha", subtitle: "Informe seu e-mail e enviaremos um link para redefinir sua senha.", footer: _jsx(Link, { to: "/login", className: "text-brand-600 hover:underline", children: "Voltar para o login" }), children: sent ? (_jsxs("div", { className: "space-y-4 text-center", children: [_jsx("div", { className: "mx-auto h-12 w-12 rounded-full bg-brand-50 p-3 text-brand-600", children: _jsx(Mail, { className: "h-6 w-6", "aria-hidden": true }) }), _jsx("p", { className: "text-sm text-foreground/80", children: "Se este e-mail estiver cadastrado, voc\u00EA receber\u00E1 um link em instantes. Verifique tamb\u00E9m sua caixa de spam." })] })) : (_jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsx(Input, { label: "E-mail", type: "email", placeholder: "voce@empresa.com", leftSlot: _jsx(Mail, { className: "h-4 w-4", "aria-hidden": true }), value: email, onChange: (e) => setEmail(e.target.value), required: true }), _jsx(Button, { type: "submit", fullWidth: true, size: "lg", loading: m.isPending, children: "Enviar link" })] })) }));
}
