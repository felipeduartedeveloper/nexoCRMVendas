import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/Logo';
export function NotFoundPage() {
    return (_jsx("div", { className: "grid min-h-screen place-items-center bg-card px-4 text-center", children: _jsxs("div", { children: [_jsx(Logo, { className: "mx-auto" }), _jsx("h1", { className: "mt-6 text-6xl font-extrabold tracking-tight text-brand-600", children: "404" }), _jsx("p", { className: "mt-3 text-lg text-foreground/80", children: "P\u00E1gina n\u00E3o encontrada." }), _jsx(Link, { to: "/", className: "mt-6 inline-block", children: _jsx(Button, { children: "Voltar para o in\u00EDcio" }) })] }) }));
}
