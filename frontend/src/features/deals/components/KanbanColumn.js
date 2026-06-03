import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import { DealCard } from './DealCard';
export function KanbanColumn({ stage, deals, total, count, currency, onAddDeal, onSelectDeal, }) {
    const { setNodeRef, isOver } = useDroppable({
        id: stage.id,
        data: { type: 'column', stageId: stage.id },
    });
    return (_jsxs("div", { className: "flex h-full w-72 shrink-0 flex-col", children: [_jsxs("div", { className: cn('mb-2 rounded-t-lg border-b-2 bg-card p-3 transition-colors', stage.isWon
                    ? 'border-success'
                    : stage.isLost
                        ? 'border-danger'
                        : 'border-brand-500'), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-bold uppercase tracking-wide text-foreground", children: stage.name }), _jsx("button", { type: "button", onClick: () => onAddDeal?.(stage.id), className: "grid h-6 w-6 place-items-center rounded text-muted-foreground/70 hover:bg-muted hover:text-foreground", "aria-label": "Novo deal nesta etapa", children: _jsx(Plus, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "mt-1 flex items-center justify-between text-[11px] text-muted-foreground", children: [_jsx("span", { className: "font-semibold text-foreground/80", children: formatMoney(total, currency) }), _jsxs("span", { children: [count, " ", count === 1 ? 'deal' : 'deals'] })] })] }), _jsx("div", { ref: setNodeRef, className: cn('flex-1 space-y-2 overflow-y-auto rounded-b-lg bg-muted/40 p-2 transition-colors', isOver && 'bg-brand-50 ring-2 ring-inset ring-brand-300'), children: _jsx(SortableContext, { items: deals.map((d) => d.id), strategy: verticalListSortingStrategy, children: deals.length === 0 ? (_jsx("div", { className: "grid h-24 place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground/70", children: "Arraste um deal aqui" })) : (deals.map((d) => (_jsx(DealCard, { deal: d, onClick: () => onSelectDeal?.(d) }, d.id)))) }) })] }));
}
