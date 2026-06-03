import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ProgressBar({ value, showLabel = true, color = '#3b82f6' }) {
    const v = Math.max(0, Math.min(100, Math.round(value)));
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "h-1.5 flex-1 overflow-hidden rounded-full bg-muted", children: _jsx("div", { className: "h-full rounded-full transition-all", style: { width: `${v}%`, backgroundColor: color } }) }), showLabel && (_jsxs("span", { className: "text-[11px] font-semibold tabular-nums text-muted-foreground", children: [v, "%"] }))] }));
}
