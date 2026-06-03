import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Mail, Shield, UserMinus, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { usersApi } from '@/api/settings.api';
import { extractErrorMessage } from '@/lib/api';
import { initials } from '@/lib/format';
import { cn } from '@/lib/cn';
const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES', 'VIEWER'];
const ROLE_BADGE = {
    SUPER_ADMIN: 'bg-brand-100 text-brand-700',
    ADMIN: 'bg-blue-100 text-blue-700',
    MANAGER: 'bg-purple-100 text-purple-700',
    SALES: 'bg-green-100 text-green-700',
    VIEWER: 'bg-muted text-foreground/80',
};
export function ManageUsersPage() {
    const qc = useQueryClient();
    const [openInvite, setOpenInvite] = useState(false);
    const q = useQuery({
        queryKey: ['settings-users'],
        queryFn: () => usersApi.list({ limit: 200 }),
    });
    const setRole = useMutation({
        mutationFn: ({ id, role }) => usersApi.update(id, { role: role }),
        onSuccess: async () => {
            toast.success('Papel atualizado.');
            await qc.invalidateQueries({ queryKey: ['settings-users'] });
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
    });
    const toggleActive = useMutation({
        mutationFn: (u) => u.isActive ? usersApi.deactivate(u.id) : usersApi.activate(u.id),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['settings-users'] });
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
    });
    const users = q.data?.items ?? [];
    return (_jsxs("div", { className: "mx-auto max-w-5xl", children: [_jsxs("header", { className: "mb-6 flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-extrabold tracking-tight text-foreground", children: "Manage users" }), _jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [q.data?.total ?? 0, " usu\u00E1rios \u00B7 convide vendedores, gerentes e administradores."] })] }), _jsxs(Button, { onClick: () => setOpenInvite(true), children: [_jsx(Plus, { className: "h-4 w-4" }), " Convidar usu\u00E1rio"] })] }), _jsx("div", { className: "overflow-hidden rounded-xl border border-border bg-card shadow-card", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border/50 bg-muted/40 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground", children: [_jsx("th", { className: "px-4 py-2.5", children: "Nome" }), _jsx("th", { className: "px-4 py-2.5", children: "E-mail" }), _jsx("th", { className: "px-4 py-2.5", children: "Papel" }), _jsx("th", { className: "px-4 py-2.5", children: "Status" }), _jsx("th", { className: "px-4 py-2.5", children: "\u00DAltimo login" }), _jsx("th", { className: "px-4 py-2.5 text-right", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { children: q.isLoading ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "p-12 text-center text-muted-foreground", children: "Carregando\u2026" }) })) : users.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "p-12 text-center text-sm text-muted-foreground", children: "Nenhum usu\u00E1rio ainda." }) })) : (users.map((u) => (_jsxs("tr", { className: "border-b border-border/50 hover:bg-brand-50/30", children: [_jsx("td", { className: "px-4 py-2.5", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700", children: initials(u.name) }), _jsx("span", { className: "font-semibold text-foreground", children: u.name })] }) }), _jsx("td", { className: "px-4 py-2.5 text-foreground/80", children: u.email }), _jsx("td", { className: "px-4 py-2.5", children: _jsx("select", { value: u.role, onChange: (e) => setRole.mutate({ id: u.id, role: e.target.value }), className: cn('rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide focus:outline-none', ROLE_BADGE[u.role] ?? 'bg-muted text-foreground/80'), children: ROLES.map((r) => (_jsx("option", { value: r, children: r }, r))) }) }), _jsx("td", { className: "px-4 py-2.5", children: _jsxs("span", { className: cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', u.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'), children: [_jsx("span", { className: cn('h-1.5 w-1.5 rounded-full', u.isActive ? 'bg-success' : 'bg-muted-foreground/40') }), u.isActive ? 'Ativo' : 'Inativo'] }) }), _jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: u.lastLoginAt
                                            ? new Date(u.lastLoginAt).toLocaleString('pt-BR')
                                            : '—' }), _jsx("td", { className: "px-4 py-2.5 text-right", children: _jsx("button", { type: "button", onClick: () => toggleActive.mutate(u), className: "inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground", children: u.isActive ? (_jsxs(_Fragment, { children: [_jsx(UserMinus, { className: "h-3.5 w-3.5" }), " Desativar"] })) : (_jsxs(_Fragment, { children: [_jsx(UserCheck, { className: "h-3.5 w-3.5" }), " Reativar"] })) }) })] }, u.id)))) })] }) }), openInvite && _jsx(InviteUserModal, { onClose: () => setOpenInvite(false) })] }));
}
function InviteUserModal({ onClose }) {
    const qc = useQueryClient();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('SALES');
    const [tempPassword, setTempPassword] = useState(null);
    const m = useMutation({
        mutationFn: () => usersApi.invite({ email, name, role }),
        onSuccess: async (resp) => {
            setTempPassword(resp.tempPassword);
            await qc.invalidateQueries({ queryKey: ['settings-users'] });
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
    });
    function onSubmit(e) {
        e.preventDefault();
        if (!email || !name)
            return toast.error('Preencha nome e e-mail.');
        m.mutate();
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-xl bg-card p-6 shadow-elevated", children: [_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "inline-flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5 text-brand-600" }), _jsx("h3", { className: "text-lg font-bold text-foreground", children: "Convidar novo usu\u00E1rio" })] }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "O usu\u00E1rio receber\u00E1 uma senha tempor\u00E1ria para o primeiro acesso." })] }), tempPassword ? (_jsxs("div", { className: "rounded-lg border border-success/30 bg-success/10 p-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-success", children: [_jsx(Mail, { className: "h-4 w-4" }), " Convite criado!"] }), _jsxs("p", { className: "mt-2 text-sm text-foreground/80", children: ["Envie estas credenciais para ", _jsx("strong", { children: email }), ":"] }), _jsxs("div", { className: "mt-3 rounded-lg bg-card p-3 font-mono text-sm", children: [_jsxs("div", { children: ["E-mail: ", email] }), _jsxs("div", { children: ["Senha tempor\u00E1ria: ", _jsx("strong", { children: tempPassword })] })] }), _jsx("div", { className: "mt-4 flex justify-end", children: _jsx(Button, { onClick: onClose, children: "Fechar" }) })] })) : (_jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Nome", value: name, onChange: (e) => setName(e.target.value), required: true }), _jsx(Input, { label: "E-mail", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true }), _jsxs("div", { children: [_jsx("span", { className: "field-label", children: "Papel" }), _jsxs("select", { value: role, onChange: (e) => setRole(e.target.value), className: "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm", children: [_jsx("option", { value: "ADMIN", children: "ADMIN \u2014 controla tudo da empresa" }), _jsx("option", { value: "MANAGER", children: "MANAGER \u2014 gerencia time e relat\u00F3rios" }), _jsx("option", { value: "SALES", children: "SALES \u2014 vendedor" }), _jsx("option", { value: "VIEWER", children: "VIEWER \u2014 somente leitura" })] })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [_jsx(Button, { variant: "ghost", type: "button", onClick: onClose, disabled: m.isPending, children: "Cancelar" }), _jsx(Button, { type: "submit", loading: m.isPending, children: "Enviar convite" })] })] }))] }) }));
}
