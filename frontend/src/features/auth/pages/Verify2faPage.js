import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { extractErrorMessage } from '@/lib/api';
export function Verify2faPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const setSession = useAuthStore((s) => s.setSession);
    const email = location.state?.email ?? '';
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const refs = useRef([]);
    useEffect(() => {
        if (!email)
            navigate('/login');
    }, [email, navigate]);
    const verify = useMutation({
        mutationFn: ({ code }) => authApi.verify2fa(email, code),
        onSuccess: (data) => {
            setSession(data);
            toast.success('Verificado! Vamos configurar sua conta.');
            navigate('/onboarding/personal');
        },
        onError: (err) => toast.error(extractErrorMessage(err, 'Código inválido ou expirado.')),
    });
    const resend = useMutation({
        mutationFn: () => authApi.resend2fa(email),
        onSuccess: () => toast.success('Novo código enviado.'),
        onError: (err) => toast.error(extractErrorMessage(err, 'Não foi possível reenviar.')),
    });
    function onChange(idx, v) {
        const ch = v.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[idx] = ch;
        setDigits(next);
        if (ch && idx < 5)
            refs.current[idx + 1]?.focus();
    }
    function onKeyDown(idx, e) {
        if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
            refs.current[idx - 1]?.focus();
        }
    }
    function onPaste(e) {
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (text.length === 6) {
            e.preventDefault();
            setDigits(text.split(''));
            refs.current[5]?.focus();
        }
    }
    function onSubmit(e) {
        e.preventDefault();
        const code = digits.join('');
        if (code.length !== 6) {
            toast.error('Informe os 6 dígitos.');
            return;
        }
        verify.mutate({ code });
    }
    return (_jsx(AuthLayout, { title: "Verifique seu e-mail", subtitle: _jsxs(_Fragment, { children: ["Enviamos um c\u00F3digo de 6 d\u00EDgitos para ", _jsx("strong", { children: email }), "."] }), footer: _jsx(Link, { to: "/login", className: "text-brand-600 hover:underline", children: "Usar outro e-mail" }), children: _jsxs("form", { onSubmit: onSubmit, className: "space-y-6", onPaste: onPaste, children: [_jsx("div", { className: "flex justify-between gap-2", children: digits.map((d, i) => (_jsx("input", { ref: (el) => (refs.current[i] = el), value: d, onChange: (e) => onChange(i, e.target.value), onKeyDown: (e) => onKeyDown(i, e), inputMode: "numeric", maxLength: 1, className: "h-14 w-12 rounded-lg border border-border bg-card text-center text-2xl font-bold text-foreground focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200", "aria-label": `Dígito ${i + 1}` }, i))) }), _jsx(Button, { type: "submit", fullWidth: true, size: "lg", loading: verify.isPending, children: "Verificar e continuar" }), _jsx("button", { type: "button", onClick: () => resend.mutate(), disabled: resend.isPending, className: "block w-full text-center text-sm text-brand-600 hover:underline disabled:opacity-50", children: resend.isPending ? 'Enviando...' : 'Reenviar código' })] }) }));
}
