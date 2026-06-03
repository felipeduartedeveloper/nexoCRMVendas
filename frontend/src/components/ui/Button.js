import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
const variantStyles = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm focus-visible:ring-brand-300',
    secondary: 'bg-muted text-foreground/90 hover:bg-muted active:bg-muted-foreground/30 focus-visible:ring-border',
    ghost: 'bg-transparent text-foreground/80 hover:bg-muted active:bg-muted focus-visible:ring-border',
    outline: 'border border-border bg-card text-foreground/90 hover:bg-muted/40 active:bg-muted focus-visible:ring-border',
    danger: 'bg-danger text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-300',
};
const sizeStyles = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
};
export const Button = forwardRef(({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...rest }, ref) => (_jsxs("button", { ref: ref, disabled: disabled || loading, className: cn('inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60', variantStyles[variant], sizeStyles[size], fullWidth && 'w-full', className), ...rest, children: [loading && _jsx(Loader2, { className: "h-4 w-4 animate-spin", "aria-hidden": true }), children] })));
Button.displayName = 'Button';
