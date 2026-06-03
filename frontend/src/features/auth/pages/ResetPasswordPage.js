import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/api/auth.api';
import { extractErrorMessage } from '@/lib/api';
export function ResetPasswordPage() {
    const [params] = useSearchParams();
    const token = params.get('token') ?? '';
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const m = useMutation({
        mutationFn: ({ token, password }) => authApi.resetPassword(token, password),
        onSuccess: () => {
            toast.success('Senha redefinida. Faça login novamente.');
            navigate('/login');
        },
        onError: (err) => toast.error(extractErrorMessage(err, 'Link inválido ou expirado.')),
    });
    function onSubmit(e) {
        e.preventDefault();
        if (!token) {
            toast.error('Token de recuperação ausente.');
            return;
        }
        if (password.length < 8) {
            toast.error('A senha precisa ter ao menos 8 caracteres.');
            return;
        }
        if (password !== confirm) {
            toast.error('As senhas não coincidem.');
            return;
        }
        m.mutate({ token, password });
    }
    return (_jsx(AuthLayout, { title: "Defina uma nova senha", subtitle: "Escolha uma senha forte que voc\u00EA n\u00E3o use em outros sites.", footer: _jsx(Link, { to: "/login", className: "text-brand-600 hover:underline", children: "Voltar para o login" }), children: _jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Nova senha", type: "password", placeholder: "M\u00EDnimo 8 caracteres", leftSlot: _jsx(Lock, { className: "h-4 w-4", "aria-hidden": true }), value: password, onChange: (e) => setPassword(e.target.value), required: true }), _jsx(Input, { label: "Confirmar senha", type: "password", placeholder: "Repita a senha", leftSlot: _jsx(Lock, { className: "h-4 w-4", "aria-hidden": true }), value: confirm, onChange: (e) => setConfirm(e.target.value), required: true }), _jsx(Button, { type: "submit", fullWidth: true, size: "lg", loading: m.isPending, children: "Salvar nova senha" })] }) }));
}
