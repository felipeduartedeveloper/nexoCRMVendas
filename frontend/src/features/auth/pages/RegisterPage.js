import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { User, Mail, Lock } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/api/auth.api';
import { extractErrorMessage } from '@/lib/api';
export function RegisterPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const m = useMutation({
        mutationFn: authApi.register,
        onSuccess: () => {
            toast.success('Conta criada! Enviamos um código para o seu e-mail.');
            navigate('/verify-2fa', { state: { email, fromRegister: true } });
        },
        onError: (err) => toast.error(extractErrorMessage(err, 'Não foi possível criar a conta.')),
    });
    function onSubmit(e) {
        e.preventDefault();
        if (password.length < 8) {
            toast.error('A senha precisa ter ao menos 8 caracteres.');
            return;
        }
        m.mutate({ name, email, password });
    }
    return (_jsx(AuthLayout, { title: "Comece gr\u00E1tis", subtitle: "14 dias de teste. Sem cart\u00E3o de cr\u00E9dito.", footer: _jsxs(_Fragment, { children: ["J\u00E1 tem conta?", ' ', _jsx(Link, { to: "/login", className: "font-semibold text-brand-600 hover:underline", children: "Entrar" })] }), children: _jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Nome completo", autoComplete: "name", placeholder: "Maria Silva", leftSlot: _jsx(User, { className: "h-4 w-4", "aria-hidden": true }), value: name, onChange: (e) => setName(e.target.value), required: true }), _jsx(Input, { label: "E-mail profissional", type: "email", autoComplete: "email", placeholder: "voce@empresa.com", leftSlot: _jsx(Mail, { className: "h-4 w-4", "aria-hidden": true }), value: email, onChange: (e) => setEmail(e.target.value), required: true }), _jsx(Input, { label: "Senha", type: "password", autoComplete: "new-password", placeholder: "M\u00EDnimo 8 caracteres", leftSlot: _jsx(Lock, { className: "h-4 w-4", "aria-hidden": true }), value: password, onChange: (e) => setPassword(e.target.value), hint: "Use ao menos 8 caracteres, com letras e n\u00FAmeros.", required: true }), _jsx(Button, { type: "submit", fullWidth: true, size: "lg", loading: m.isPending, children: "Criar minha conta" }), _jsxs("p", { className: "text-center text-xs text-muted-foreground", children: ["Ao criar a conta voc\u00EA concorda com nossos", ' ', _jsx("a", { href: "#", className: "text-brand-600 hover:underline", children: "Termos" }), ' ', "e a", ' ', _jsx("a", { href: "#", className: "text-brand-600 hover:underline", children: "Pol\u00EDtica de Privacidade" }), "."] })] }) }));
}
