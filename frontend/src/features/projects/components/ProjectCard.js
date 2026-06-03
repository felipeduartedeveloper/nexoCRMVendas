import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, GripVertical } from 'lucide-react';
import { HealthBadge } from './HealthBadge';
import { ProgressBar } from './ProgressBar';
export function ProjectCard({ project, onOpen }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: project.id,
        data: { phaseId: project.phaseId },
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };
    return (_jsxs("div", { ref: setNodeRef, style: style, onClick: () => onOpen?.(project), className: "group cursor-pointer rounded-lg border border-border bg-card p-3 shadow-card transition-shadow hover:shadow-elevated", children: [_jsxs("div", { className: "flex items-start gap-2", children: [_jsx("button", { type: "button", ...attributes, ...listeners, "aria-label": "Arrastar", onClick: (e) => e.stopPropagation(), className: "grid h-5 w-5 cursor-grab place-items-center rounded text-muted-foreground/70 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 active:cursor-grabbing", children: _jsx(GripVertical, { className: "h-4 w-4" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("h3", { className: "truncate text-sm font-semibold text-foreground", children: project.title }), project.endDate && (_jsxs("p", { className: "mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground", children: [_jsx(Calendar, { className: "h-3 w-3" }), new Date(project.endDate).toLocaleDateString('pt-BR')] }))] })] }), _jsx("div", { className: "mt-2", children: _jsx(ProgressBar, { value: project.progress }) }), _jsxs("div", { className: "mt-2 flex items-center justify-between", children: [_jsx(HealthBadge, { value: project.health }), project.labels && project.labels.length > 0 && (_jsxs("span", { className: "text-[10px] text-muted-foreground", children: [project.labels.length, " tag(s)"] }))] })] }));
}
