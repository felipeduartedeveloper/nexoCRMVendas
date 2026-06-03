import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Mail, Lock, KeyRound, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Turnstile } from '@/components/Turnstile';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { extractErrorMessage } from '@/lib/api';
export function LoginPage() {
    const navigate = useNavigate();
    const setSession = useAuthStore((s) => s.setSession);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [totpStep, setTotpStep] = useState(false);
    const [totpToken, setTotpToken] = useState('');
    const [code, setCode] = useState('');
    const turnstileRef = useRef(null);
    const onCaptcha = useCallback((t) => setCaptcha(t), []);
    const m = useMutation({
        mutationFn: () => authApi.login({ email, password, captchaToken: captcha }),
        onSuccess: (resp) => {
            if (resp.requires2fa) {
                toast('Enviamos um código para o seu e-mail.');
                navigate('/verify-2fa', { state: { email } });
                return;
            }
            if (resp.status === 'TOTP_REQUIRED' && resp.totpToken) {
                setTotpToken(resp.totpToken);
                setTotpStep(true);
                return;
            }
            if (resp.user && resp.accessToken && resp.refreshToken) {
                setSession({ user: resp.user, accessToken: resp.accessToken, refreshToken: resp.refreshToken });
                toast.success('Bem-vindo de volta!');
                navigate('/dashboard');
            }
        },
        onError: (err) => {
            // token Turnstile é de uso único — gera um novo pra próxima tentativa
            turnstileRef.current?.reset();
            toast.error(extractErrorMessage(err, 'Falha no login.'));
        },
    });
    const totpM = useMutation({
        mutationFn: () => authApi.totpVerifyLogin(totpToken, code),
        onSuccess: (resp) => {
            setSession({ user: resp.user, accessToken: resp.accessToken, refreshToken: resp.refreshToken });
            toast.success('Bem-vindo de volta!');
            navigate('/dashboard');
        },
        onError: (err) => toast.error(extractErrorMessage(err, 'Código inválido.')),
    });
    function onSubmit(e) {
        e.preventDefault();
        if (totpStep) {
            if (code.length !== 6)
                return toast.error('Digite o código de 6 dígitos.');
            return totpM.mutate();
        }
        if (!email || !password) {
            toast.error('Informe e-mail e senha.');
            return;
        }
        m.mutate();
    }
    return (_jsx(AuthLayout, { title: totpStep ? 'Verificação em duas etapas' : 'Entrar', subtitle: totpStep
            ? 'Digite o código do seu aplicativo autenticador.'
            : 'Acesse sua conta para gerenciar seu funil de vendas.', footer: totpStep ? (_jsx("button", { type: "button", onClick: () => {
                setTotpStep(false);
                setCode('');
            }, className: "font-semibold text-brand-600 hover:underline", children: "Voltar ao login" })) : (_jsxs(_Fragment, { children: ["Ainda n\u00E3o tem conta?", ' ', _jsx(Link, { to: "/register", className: "font-semibold text-brand-600 hover:underline", children: "Criar conta gr\u00E1tis" })] })), children: _jsx("form", { onSubmit: onSubmit, className: "space-y-4", children: totpStep ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-foreground", children: [_jsx(ShieldCheck, { className: "h-4 w-4 text-brand-600" }), " C\u00F3digo do autenticador"] }), _jsx(Input, { label: "C\u00F3digo de 6 d\u00EDgitos", inputMode: "numeric", maxLength: 6, autoFocus: true, placeholder: "000000", className: "text-center font-mono text-lg tracking-[0.4em]", leftSlot: _jsx(KeyRound, { className: "h-4 w-4", "aria-hidden": true }), value: code, onChange: (e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6)), required: true }), _jsx(Button, { type: "submit", fullWidth: true, size: "lg", loading: totpM.isPending, children: "Verificar e entrar" })] })) : (_jsxs(_Fragment, { children: [_jsx(Input, { label: "E-mail", type: "email", autoComplete: "email", placeholder: "voce@empresa.com", leftSlot: _jsx(Mail, { className: "h-4 w-4", "aria-hidden": true }), value: email, onChange: (e) => setEmail(e.target.value), required: true }), _jsx(Input, { label: "Senha", type: "password", autoComplete: "current-password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", leftSlot: _jsx(Lock, { className: "h-4 w-4", "aria-hidden": true }), value: password, onChange: (e) => setPassword(e.target.value), required: true }), _jsx("div", { className: "flex items-center justify-end", children: _jsx(Link, { to: "/forgot-password", className: "text-xs font-medium text-brand-600 hover:underline", children: "Esqueci minha senha" }) }), _jsx(Turnstile, { ref: turnstileRef, onToken: onCaptcha }), _jsx(Button, { type: "submit", fullWidth: true, size: "lg", loading: m.isPending, children: "Entrar" })] })) }) }));
}
