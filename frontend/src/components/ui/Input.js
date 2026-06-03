import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';
export const Input = forwardRef(({ label, hint, error, leftSlot, rightSlot, className, id, ...rest }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    return (_jsxs("div", { className: "w-full", children: [label && (_jsx("label", { htmlFor: inputId, className: "field-label", children: label })), _jsxs("div", { className: cn('flex items-center gap-2 rounded-lg border bg-card px-3 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200', error ? 'border-danger' : 'border-border hover:border-muted-foreground/40', rest.disabled && 'cursor-not-allowed bg-muted/40'), children: [leftSlot && _jsx("span", { className: "text-muted-foreground/70", children: leftSlot }), _jsx("input", { id: inputId, ref: ref, className: cn('h-10 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none', className), ...rest }), rightSlot && _jsx("span", { className: "text-muted-foreground/70", children: rightSlot })] }), hint && !error && _jsx("p", { className: "field-hint", children: hint }), error && _jsx("p", { className: "field-error", children: error })] }));
});
Input.displayName = 'Input';
