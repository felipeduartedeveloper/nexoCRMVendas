import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function PageHeader({ title, subtitle, actions }) {
    return (_jsxs("div", { className: "mb-6 flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-extrabold tracking-tight text-foreground", children: title }), subtitle && _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: subtitle })] }), actions && _jsx("div", { className: "flex items-center gap-2", children: actions })] }));
}
