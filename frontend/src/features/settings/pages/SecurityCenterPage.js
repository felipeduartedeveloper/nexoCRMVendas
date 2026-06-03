import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Smartphone, Lock, AlertTriangle, History, ShieldCheck, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { extractErrorMessage } from '@/lib/api';
const otherItems = [
    {
        icon: Smartphone,
        title: 'Sessões ativas',
        desc: 'Lista de dispositivos com sessão ativa.',
        note: 'Em breve.',
    },
    {
        icon: AlertTriangle,
        title: 'Alertas de login suspeito',
        desc: 'Notificações ao detectar acesso de novos IPs/dispositivos.',
        note: 'Em breve.',
    },
    {
        icon: History,
        title: 'Trilha de auditoria',
        desc: 'Histórico imutável de mudanças críticas em deals/users.',
        note: 'Disponível no Power+',
    },
];
function TwoFactorCard() {
    const setUser = useAuthStore((s) => s.setUser);
    const storeUser = useAuthStore((s) => s.user);
    const [enabled, setEnabled] = useState(!!storeUser?.totpEnabled);
    const [mode, setMode] = useState('idle');
    const [secret, setSecret] = useState(null);
    const [code, setCode] = useState('');
    // fonte de verdade: /auth/me (totpEnabled real)
    const meQ = useQuery({ queryKey: ['auth', 'me'], queryFn: authApi.me });
    useEffect(() => {
        if (meQ.data) {
            setEnabled(!!meQ.data.totpEnabled);
            if (storeUser)
                setUser({ ...storeUser, ...meQ.data });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meQ.data]);
    function reset() {
        setMode('idle');
        setSecret(null);
        setCode('');
    }
    const initM = useMutation({
        mutationFn: authApi.totpInit,
        onSuccess: (data) => {
            setSecret(data);
            setMode('setup');
            setCode('');
        },
        onError: (err) => toast.error(extractErrorMessage(err, 'Não foi possível iniciar o 2FA.')),
    });
    const confirmM = useMutation({
        mutationFn: () => authApi.totpConfirm(code),
        onSuccess: () => {
            setEnabled(true);
            if (storeUser)
                setUser({ ...storeUser, totpEnabled: true });
            reset();
            toast.success('2FA ativado com sucesso!');
        },
        onError: (err) => toast.error(extractErrorMessage(err, 'Código inválido.')),
    });
    const disableM = useMutation({
        mutationFn: () => authApi.totpDisable(code),
        onSuccess: () => {
            setEnabled(false);
            if (storeUser)
                setUser({ ...storeUser, totpEnabled: false });
            reset();
            toast.success('2FA desativado.');
        },
        onError: (err) => toast.error(extractErrorMessage(err, 'Código inválido.')),
    });
    return (_jsxs("li", { className: "rounded-xl border border-border bg-card p-5 shadow-card", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("span", { className: 'grid h-10 w-10 shrink-0 place-items-center rounded-lg ' +
                            (enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'), children: _jsx(Lock, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "font-bold text-foreground", children: "Autentica\u00E7\u00E3o em duas etapas (2FA)" }), _jsx("span", { className: 'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ' +
                                            (enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'), children: enabled ? 'Ativo' : 'Inativo' })] }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Use o Google Authenticator, Authy ou 1Password para gerar c\u00F3digos de 6 d\u00EDgitos no login." })] }), mode === 'idle' && (_jsx(_Fragment, { children: enabled ? (_jsx(Button, { variant: "outline", size: "sm", onClick: () => setMode('disable'), children: "Desativar" })) : (_jsxs(Button, { size: "sm", loading: initM.isPending, onClick: () => initM.mutate(), children: [_jsx(ShieldCheck, { className: "h-4 w-4" }), " Ativar 2FA"] })) }))] }), mode === 'setup' && secret && (_jsxs("div", { className: "mt-5 space-y-4 rounded-lg border border-border bg-muted/30 p-5", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "1. Escaneie o QR no app autenticador. 2. Digite o c\u00F3digo de 6 d\u00EDgitos para confirmar." }), _jsx("img", { src: secret.qrDataUrl, alt: "QR Code 2FA", width: 184, height: 184, className: "mx-auto rounded-lg border border-border bg-white p-2" }), _jsxs("p", { className: "break-all text-center font-mono text-[11px] text-muted-foreground", children: ["chave manual: ", secret.secret] }), _jsx(Input, { inputMode: "numeric", maxLength: 6, placeholder: "000000", className: "text-center font-mono text-lg tracking-[0.4em]", leftSlot: _jsx(KeyRound, { className: "h-4 w-4" }), value: code, onChange: (e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6)) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { fullWidth: true, loading: confirmM.isPending, disabled: code.length !== 6, onClick: () => confirmM.mutate(), children: "Confirmar e ativar" }), _jsx(Button, { variant: "outline", onClick: reset, children: "Cancelar" })] })] })), mode === 'disable' && (_jsxs("div", { className: "mt-5 space-y-4 rounded-lg border border-border bg-muted/30 p-5", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Digite um c\u00F3digo atual do autenticador para confirmar a desativa\u00E7\u00E3o." }), _jsx(Input, { inputMode: "numeric", maxLength: 6, placeholder: "000000", className: "text-center font-mono text-lg tracking-[0.4em]", leftSlot: _jsx(KeyRound, { className: "h-4 w-4" }), value: code, onChange: (e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6)) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "danger", fullWidth: true, loading: disableM.isPending, disabled: code.length !== 6, onClick: () => disableM.mutate(), children: "Desativar 2FA" }), _jsx(Button, { variant: "outline", onClick: reset, children: "Cancelar" })] })] }))] }));
}
function EmailOtpCard() {
    const setUser = useAuthStore((s) => s.setUser);
    const storeUser = useAuthStore((s) => s.user);
    const meQ = useQuery({ queryKey: ['auth', 'me', 'emailotp'], queryFn: authApi.me });
    const enabled = meQ.data?.emailOtpEnabled ?? !!storeUser?.emailOtpEnabled;
    const isSuperAdmin = (meQ.data?.role ?? storeUser?.role) === 'SUPER_ADMIN';
    const toggleM = useMutation({
        mutationFn: () => (enabled ? authApi.emailOtpDisable() : authApi.emailOtpEnable()),
        onSuccess: (r) => {
            if (storeUser)
                setUser({ ...storeUser, emailOtpEnabled: r.emailOtpEnabled });
            meQ.refetch();
            toast.success(r.emailOtpEnabled ? '2FA por e-mail ativado.' : '2FA por e-mail desativado.');
        },
        onError: (err) => toast.error(extractErrorMessage(err, 'Não foi possível alterar.')),
    });
    return (_jsxs("li", { className: "flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-card", children: [_jsx("span", { className: 'grid h-10 w-10 shrink-0 place-items-center rounded-lg ' + (enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'), children: _jsx(Smartphone, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "font-bold text-foreground", children: "2FA por e-mail" }), _jsx("span", { className: 'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ' + (enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'), children: enabled ? 'Ativo' : 'Inativo' })] }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Receba um c\u00F3digo de 6 d\u00EDgitos por e-mail a cada login. Alternativa ao app autenticador." })] }), !isSuperAdmin && (_jsx(Button, { variant: enabled ? 'outline' : 'primary', size: "sm", loading: toggleM.isPending, onClick: () => toggleM.mutate(), children: enabled ? 'Desativar' : 'Ativar' }))] }));
}
export function SecurityCenterPage() {
    return (_jsxs("div", { className: "mx-auto max-w-4xl", children: [_jsxs("header", { className: "mb-6", children: [_jsx("h1", { className: "text-2xl font-extrabold tracking-tight text-foreground", children: "Security center" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Controles de seguran\u00E7a da sua conta." })] }), _jsxs("ul", { className: "space-y-3", children: [_jsx(TwoFactorCard, {}), _jsx(EmailOtpCard, {}), otherItems.map((it) => (_jsxs("li", { className: "flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-card", children: [_jsx("span", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground", children: _jsx(it.icon, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "font-bold text-foreground", children: it.title }), _jsx("span", { className: "rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground", children: it.note })] }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: it.desc })] })] }, it.title)))] })] }));
}
