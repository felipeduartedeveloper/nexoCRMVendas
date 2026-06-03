import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Globe, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { OnboardingShell } from '../components/OnboardingShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useOnboardingDraft } from '../store/onboarding-draft.store';
const industries = [
    'SaaS / Tech',
    'Agência / Consultoria',
    'E-commerce',
    'Educação',
    'Saúde',
    'Imobiliário',
    'Serviços Financeiros',
    'Manufatura',
    'Varejo',
    'Outro',
];
const ranges = ['Só eu', '2-10', '11-50', '51-200', '201-500', '500+'];
const countries = [
    { code: 'BR', name: 'Brasil', currency: 'BRL' },
    { code: 'PT', name: 'Portugal', currency: 'EUR' },
    { code: 'US', name: 'Estados Unidos', currency: 'USD' },
    { code: 'AR', name: 'Argentina', currency: 'ARS' },
    { code: 'MX', name: 'México', currency: 'MXN' },
    { code: 'ES', name: 'Espanha', currency: 'EUR' },
];
export function CompanyInfoPage() {
    const navigate = useNavigate();
    const draft = useOnboardingDraft();
    const [name, setName] = useState(draft.company.name);
    const [industry, setIndustry] = useState(draft.company.industry);
    const [range, setRange] = useState(draft.company.employeesRange);
    const [country, setCountry] = useState(draft.company.country || 'BR');
    const [website, setWebsite] = useState(draft.company.website);
    function onSubmit(e) {
        e.preventDefault();
        if (!name.trim() || !industry || !range) {
            toast.error('Preencha nome da empresa, indústria e tamanho.');
            return;
        }
        const currency = countries.find((c) => c.code === country)?.currency ?? draft.company.currency;
        draft.setCompany({
            name: name.trim(),
            industry,
            employeesRange: range,
            country,
            currency,
            website: website.trim(),
        });
        navigate('/onboarding/setup-tour');
    }
    return (_jsx(OnboardingShell, { step: 2, title: "Conte um pouco sobre sua empresa.", subtitle: "Usamos isso para sugerir pipelines, m\u00E9tricas e integra\u00E7\u00F5es ideais para voc\u00EA.", children: _jsxs("form", { onSubmit: onSubmit, className: "space-y-5", children: [_jsx(Input, { label: "Nome da empresa", leftSlot: _jsx(Building2, { className: "h-4 w-4" }), value: name, onChange: (e) => setName(e.target.value), required: true }), _jsxs("div", { children: [_jsx("span", { className: "field-label", children: "Em qual setor?" }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: industries.map((i) => (_jsx("button", { type: "button", onClick: () => setIndustry(i), className: 'rounded-lg border px-3 py-2 text-left text-sm transition-colors ' +
                                    (industry === i
                                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-100'
                                        : 'border-border bg-card text-foreground/90 hover:border-border'), children: i }, i))) })] }), _jsxs("div", { children: [_jsx("span", { className: "field-label", children: "Quantas pessoas no time?" }), _jsx("div", { className: "flex flex-wrap gap-2", children: ranges.map((r) => (_jsx("button", { type: "button", onClick: () => setRange(r), className: 'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ' +
                                    (range === r
                                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-100'
                                        : 'border-border bg-card text-foreground/80 hover:border-border'), children: r }, r))) })] }), _jsxs("div", { children: [_jsxs("span", { className: "field-label flex items-center gap-2", children: [_jsx(Globe, { className: "h-4 w-4 text-muted-foreground" }), " Pa\u00EDs"] }), _jsx("select", { value: country, onChange: (e) => setCountry(e.target.value), className: "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200", children: countries.map((c) => (_jsxs("option", { value: c.code, children: [c.name, " (", c.currency, ")"] }, c.code))) })] }), _jsx(Input, { label: "Website (opcional)", placeholder: "https://suaempresa.com.br", leftSlot: _jsx(LinkIcon, { className: "h-4 w-4" }), value: website, onChange: (e) => setWebsite(e.target.value) }), _jsxs("div", { className: "flex items-center justify-between pt-2", children: [_jsxs(Button, { type: "button", variant: "ghost", onClick: () => navigate('/onboarding/personal'), children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), " Voltar"] }), _jsx(Button, { type: "submit", size: "lg", children: "Continuar" })] })] }) }));
}
