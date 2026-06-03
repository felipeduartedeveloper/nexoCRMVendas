import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { ProjectCard } from './ProjectCard';
export function ProjectKanbanColumn({ phase, projects, count, avgProgress, onAdd, onOpen, }) {
    const { setNodeRef, isOver } = useDroppable({
        id: phase.id,
        data: { phaseId: phase.id },
    });
    return (_jsxs("div", { className: "flex w-[300px] flex-shrink-0 flex-col rounded-xl bg-muted/40", children: [_jsxs("header", { className: "rounded-t-xl bg-card px-3 py-2.5", style: { borderTop: `3px solid ${phase.color}` }, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "truncate text-sm font-bold text-foreground", children: phase.name }), _jsx("span", { className: "rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground", children: count })] }), _jsxs("p", { className: "mt-0.5 text-[11px] text-muted-foreground", children: ["Progresso m\u00E9dio \u00B7 ", avgProgress, "%"] })] }), _jsxs("div", { ref: setNodeRef, className: `flex flex-1 flex-col gap-2 overflow-y-auto p-2 transition-colors ${isOver ? 'bg-brand-50' : ''}`, children: [_jsx(SortableContext, { items: projects.map((p) => p.id), strategy: verticalListSortingStrategy, children: projects.map((p) => (_jsx(ProjectCard, { project: p, onOpen: onOpen }, p.id))) }), projects.length === 0 && (_jsx("div", { className: "rounded-lg border border-dashed border-border p-4 text-center text-[11px] text-muted-foreground/70", children: "Arraste projetos para c\u00E1" }))] }), _jsx("button", { type: "button", onClick: () => onAdd(phase.id), className: "m-2 rounded-md border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground", children: "+ Adicionar projeto" })] }));
}
