import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
export function Spinner({ size = 20, className, label, fullPage }) {
    const content = (_jsxs("div", { className: cn('inline-flex items-center gap-2 text-muted-foreground', className), children: [_jsx(Loader2, { className: "animate-spin", width: size, height: size, "aria-hidden": true }), label && _jsx("span", { className: "text-sm", children: label })] }));
    if (fullPage) {
        return (_jsx("div", { className: "flex h-screen w-full items-center justify-center bg-card", children: content }));
    }
    return content;
}
