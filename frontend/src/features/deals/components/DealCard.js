import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Building2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
export function DealCard({ deal, onClick }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: deal.id,
        data: { type: 'deal', stageId: deal.stageId },
    });
    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };
    return (_jsx("div", { ref: setNodeRef, style: style, className: cn('group rounded-lg border bg-card p-3 shadow-card transition-shadow', 'hover:border-brand-300 hover:shadow-elevated', isDragging
            ? 'border-brand-500 opacity-50 ring-2 ring-brand-200'
            : 'border-border'), children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx("button", { type: "button", ...attributes, ...listeners, className: "mt-0.5 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing", "aria-label": "Arrastar deal", children: _jsx(GripVertical, { className: "h-4 w-4" }) }), _jsxs("button", { type: "button", onClick: onClick, className: "flex-1 text-left", children: [_jsx("div", { className: "line-clamp-2 text-sm font-semibold text-foreground", children: deal.title }), deal.orgCompanyId && (_jsxs("div", { className: "mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground", children: [_jsx(Building2, { className: "h-3 w-3" }), "Empresa associada"] })), _jsx("div", { className: "mt-2 inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-bold text-success", children: formatMoney(deal.value, deal.currency) })] })] }) }));
}
