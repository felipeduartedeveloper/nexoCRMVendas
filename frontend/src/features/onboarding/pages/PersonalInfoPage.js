import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { OnboardingShell } from '../components/OnboardingShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useOnboardingDraft } from '../store/onboarding-draft.store';
import { useAuthStore } from '@/store/auth.store';
const roles = [
    'CEO / Fundador(a)',
    'Diretor(a) Comercial',
    'Gerente de Vendas',
    'SDR / Pré-venda',
    'Vendedor(a)',
    'Marketing',
    'Operações',
    'Outro',
];
export function PersonalInfoPage() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const draft = useOnboardingDraft();
    const [fullName, setFullName] = useState(draft.personal.fullName || user?.name || '');
    const [phone, setPhone] = useState(draft.personal.phone || '');
    const [role, setRole] = useState(draft.personal.role || '');
    function onSubmit(e) {
        e.preventDefault();
        if (!fullName.trim() || !role) {
            toast.error('Preencha nome e papel.');
            return;
        }
        draft.setPersonal({ fullName: fullName.trim(), phone: phone.trim(), role });
        navigate('/onboarding/company');
    }
    return (_jsx(OnboardingShell, { step: 1, title: "Vamos personalizar seu CRM.", subtitle: "Conte um pouco sobre voc\u00EA para adaptarmos a experi\u00EAncia.", children: _jsxs("form", { onSubmit: onSubmit, className: "space-y-5", children: [_jsx(Input, { label: "Nome completo", leftSlot: _jsx(User, { className: "h-4 w-4" }), value: fullName, onChange: (e) => setFullName(e.target.value), required: true }), _jsx(Input, { label: "Telefone (opcional)", leftSlot: _jsx(Phone, { className: "h-4 w-4" }), placeholder: "+55 11 99999-9999", value: phone, onChange: (e) => setPhone(e.target.value) }), _jsxs("div", { children: [_jsxs("span", { className: "field-label flex items-center gap-2", children: [_jsx(Briefcase, { className: "h-4 w-4 text-muted-foreground" }), " Qual seu papel?"] }), _jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-2", children: roles.map((r) => (_jsx("button", { type: "button", onClick: () => setRole(r), className: 'rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ' +
                                    (role === r
                                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-100'
                                        : 'border-border bg-card text-foreground/90 hover:border-border'), children: r }, r))) })] }), _jsx("div", { className: "flex justify-end pt-2", children: _jsx(Button, { type: "submit", size: "lg", children: "Continuar" }) })] }) }));
}
