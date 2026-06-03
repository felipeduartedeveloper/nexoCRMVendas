import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DndContext, PointerSensor, closestCorners, useSensor, useSensors, DragOverlay, } from '@dnd-kit/core';
import { FolderKanban, Plus } from 'lucide-react';
import { projectsApi, } from '@/api/projects.api';
import { ProjectKanbanColumn } from '../components/ProjectKanbanColumn';
import { ProjectCard } from '../components/ProjectCard';
import { NewProjectModal } from '../components/NewProjectModal';
import { ProjectDetailDrawer } from '../components/ProjectDetailDrawer';
export function ProjectsBoardPage() {
    const qc = useQueryClient();
    const [boardId, setBoardId] = useState(null);
    const [newOpen, setNewOpen] = useState(false);
    const [newPhaseId, setNewPhaseId] = useState(null);
    const [openId, setOpenId] = useState(null);
    const [activeProject, setActiveProject] = useState(null);
    const boardsQ = useQuery({
        queryKey: ['project-boards'],
        queryFn: projectsApi.listBoards,
    });
    const currentBoardId = boardId ?? boardsQ.data?.find((b) => b.isDefault)?.id ?? boardsQ.data?.[0]?.id ?? null;
    const phasesQ = useQuery({
        queryKey: ['project-phases', currentBoardId],
        queryFn: () => projectsApi.listPhases(currentBoardId),
        enabled: !!currentBoardId,
    });
    const projectsQ = useQuery({
        queryKey: ['projects', { boardId: currentBoardId }],
        queryFn: () => projectsApi.list({ boardId: currentBoardId, status: 'OPEN' }),
        enabled: !!currentBoardId,
    });
    const summaryQ = useQuery({
        queryKey: ['projects-summary', currentBoardId],
        queryFn: () => projectsApi.summary(currentBoardId),
        enabled: !!currentBoardId,
    });
    const moveMut = useMutation({
        mutationFn: (input) => projectsApi.move(input.id, input.phaseId, input.order),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['projects', { boardId: currentBoardId }] });
            qc.invalidateQueries({ queryKey: ['projects-summary', currentBoardId] });
        },
    });
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
    const projectsByPhase = useMemo(() => {
        const map = new Map();
        (phasesQ.data ?? []).forEach((ph) => map.set(ph.id, []));
        (projectsQ.data ?? []).forEach((p) => {
            if (!map.has(p.phaseId))
                map.set(p.phaseId, []);
            map.get(p.phaseId).push(p);
        });
        map.forEach((list) => list.sort((a, b) => a.phaseOrderIndex - b.phaseOrderIndex));
        return map;
    }, [phasesQ.data, projectsQ.data]);
    const summaryByPhase = useMemo(() => {
        const map = new Map();
        (summaryQ.data ?? []).forEach((s) => map.set(s.phaseId, { count: s.count, avgProgress: s.avgProgress }));
        return map;
    }, [summaryQ.data]);
    function onDragStart(e) {
        const id = e.active.id;
        setActiveProject((projectsQ.data ?? []).find((p) => p.id === id) ?? null);
    }
    function onDragEnd(e) {
        setActiveProject(null);
        const { active, over } = e;
        if (!over)
            return;
        const dragged = (projectsQ.data ?? []).find((p) => p.id === active.id);
        if (!dragged)
            return;
        let targetPhaseId = over.data.current?.phaseId;
        if (!targetPhaseId && phasesQ.data?.find((ph) => ph.id === over.id)) {
            targetPhaseId = over.id;
        }
        if (!targetPhaseId) {
            const onProject = (projectsQ.data ?? []).find((p) => p.id === over.id);
            if (onProject)
                targetPhaseId = onProject.phaseId;
        }
        if (!targetPhaseId)
            return;
        const list = projectsByPhase.get(targetPhaseId) ?? [];
        let targetIndex = list.length;
        if (over.id !== targetPhaseId) {
            const idx = list.findIndex((p) => p.id === over.id);
            if (idx >= 0)
                targetIndex = idx;
        }
        if (dragged.phaseId === targetPhaseId && dragged.phaseOrderIndex === targetIndex)
            return;
        qc.setQueryData(['projects', { boardId: currentBoardId }], (prev) => {
            if (!prev)
                return prev;
            return prev.map((p) => p.id === dragged.id ? { ...p, phaseId: targetPhaseId, phaseOrderIndex: targetIndex } : p);
        });
        moveMut.mutate({ id: dragged.id, phaseId: targetPhaseId, order: targetIndex });
    }
    if (boardsQ.isLoading) {
        return _jsx("div", { className: "p-8 text-sm text-muted-foreground", children: "Carregando quadros..." });
    }
    if (!currentBoardId) {
        return (_jsxs("div", { className: "grid place-items-center p-16 text-center", children: [_jsx(FolderKanban, { className: "h-12 w-12 text-muted-foreground/50" }), _jsx("h2", { className: "mt-3 text-base font-semibold text-foreground", children: "Nenhum quadro de projetos" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Crie seu primeiro projeto e um quadro padr\u00E3o ser\u00E1 gerado automaticamente." })] }));
    }
    return (_jsxs("div", { className: "flex h-full flex-col", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-foreground", children: "Projetos" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Acompanhe o p\u00F3s-venda em um Kanban paralelo aos neg\u00F3cios." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [boardsQ.data && boardsQ.data.length > 1 && (_jsx("select", { value: currentBoardId, onChange: (e) => setBoardId(e.target.value), className: "h-9 rounded-md border border-border bg-card px-2 text-sm", children: boardsQ.data.map((b) => (_jsx("option", { value: b.id, children: b.name }, b.id))) })), _jsxs("button", { type: "button", onClick: () => {
                                    setNewPhaseId(phasesQ.data?.[0]?.id ?? null);
                                    setNewOpen(true);
                                }, className: "inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700", children: [_jsx(Plus, { className: "h-4 w-4" }), "Novo projeto"] })] })] }), _jsxs(DndContext, { sensors: sensors, collisionDetection: closestCorners, onDragStart: onDragStart, onDragEnd: onDragEnd, children: [_jsx("div", { className: "flex h-[calc(100vh-180px)] gap-3 overflow-x-auto p-4", children: (phasesQ.data ?? []).map((phase) => (_jsx(ProjectKanbanColumn, { phase: phase, projects: projectsByPhase.get(phase.id) ?? [], count: summaryByPhase.get(phase.id)?.count ?? 0, avgProgress: summaryByPhase.get(phase.id)?.avgProgress ?? 0, onAdd: (phaseId) => {
                                setNewPhaseId(phaseId);
                                setNewOpen(true);
                            }, onOpen: (p) => setOpenId(p.id) }, phase.id))) }), _jsx(DragOverlay, { children: activeProject ? _jsx(ProjectCard, { project: activeProject }) : null })] }), newOpen && phasesQ.data && (_jsx(NewProjectModal, { open: true, onClose: () => setNewOpen(false), boardId: currentBoardId, phases: phasesQ.data, defaultPhaseId: newPhaseId })), _jsx(ProjectDetailDrawer, { projectId: openId, open: openId !== null, onClose: () => setOpenId(null) })] }));
}
