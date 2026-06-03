import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
const widths = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-lg',
    lg: 'w-full max-w-2xl',
    xl: 'w-full max-w-4xl',
};
export function Drawer({ open, onClose, title, subtitle, width = 'lg', children, headerActions, }) {
    useEffect(() => {
        if (!open)
            return;
        function onKey(e) {
            if (e.key === 'Escape')
                onClose();
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);
    return (_jsxs("div", { className: cn('fixed inset-0 z-40 transition-opacity', open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'), "aria-hidden": !open, children: [_jsx("div", { className: "absolute inset-0 bg-black/40", onClick: onClose, "aria-hidden": true }), _jsxs("aside", { role: "dialog", "aria-modal": "true", className: cn('absolute right-0 top-0 flex h-full flex-col bg-card shadow-elevated transition-transform duration-200', widths[width], open ? 'translate-x-0' : 'translate-x-full'), children: [_jsxs("header", { className: "flex items-start justify-between gap-3 border-b border-border p-5", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [typeof title === 'string' ? (_jsx("h2", { className: "truncate text-lg font-bold text-foreground", children: title })) : (title), subtitle && (_jsx("div", { className: "mt-1 text-sm text-muted-foreground", children: subtitle }))] }), headerActions, _jsx("button", { type: "button", onClick: onClose, "aria-label": "Fechar", className: "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted", children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto", children: children })] })] }));
}
