import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/lib/cn';
export function Card({ className, children, ...rest }) {
    return (_jsx("div", { className: cn('rounded-xl border border-border bg-card shadow-card', className), ...rest, children: children }));
}
export function CardBody({ className, ...rest }) {
    return _jsx("div", { className: cn('p-6', className), ...rest });
}
export function CardHeader({ className, ...rest }) {
    return _jsx("div", { className: cn('border-b border-border p-6', className), ...rest });
}
