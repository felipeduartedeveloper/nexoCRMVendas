import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { FolderKanban, Plus } from 'lucide-react';
import {
  projectsApi,
  type Project,
} from '@/api/projects.api';
import { ProjectKanbanColumn } from '../components/ProjectKanbanColumn';
import { ProjectCard } from '../components/ProjectCard';
import { NewProjectModal } from '../components/NewProjectModal';
import { ProjectDetailDrawer } from '../components/ProjectDetailDrawer';

export function ProjectsBoardPage() {
  const qc = useQueryClient();
  const [boardId, setBoardId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newPhaseId, setNewPhaseId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const boardsQ = useQuery({
    queryKey: ['project-boards'],
    queryFn: projectsApi.listBoards,
  });

  const currentBoardId =
    boardId ?? boardsQ.data?.find((b) => b.isDefault)?.id ?? boardsQ.data?.[0]?.id ?? null;

  const phasesQ = useQuery({
    queryKey: ['project-phases', currentBoardId],
    queryFn: () => projectsApi.listPhases(currentBoardId!),
    enabled: !!currentBoardId,
  });

  const projectsQ = useQuery({
    queryKey: ['projects', { boardId: currentBoardId }],
    queryFn: () => projectsApi.list({ boardId: currentBoardId!, status: 'OPEN' }),
    enabled: !!currentBoardId,
  });

  const summaryQ = useQuery({
    queryKey: ['projects-summary', currentBoardId],
    queryFn: () => projectsApi.summary(currentBoardId!),
    enabled: !!currentBoardId,
  });

  const moveMut = useMutation({
    mutationFn: (input: { id: string; phaseId: string; order: number }) =>
      projectsApi.move(input.id, input.phaseId, input.order),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', { boardId: currentBoardId }] });
      qc.invalidateQueries({ queryKey: ['projects-summary', currentBoardId] });
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const projectsByPhase = useMemo(() => {
    const map = new Map<string, Project[]>();
    (phasesQ.data ?? []).forEach((ph) => map.set(ph.id, []));
    (projectsQ.data ?? []).forEach((p) => {
      if (!map.has(p.phaseId)) map.set(p.phaseId, []);
      map.get(p.phaseId)!.push(p);
    });
    map.forEach((list) => list.sort((a, b) => a.phaseOrderIndex - b.phaseOrderIndex));
    return map;
  }, [phasesQ.data, projectsQ.data]);

  const summaryByPhase = useMemo(() => {
    const map = new Map<string, { count: number; avgProgress: number }>();
    (summaryQ.data ?? []).forEach((s) =>
      map.set(s.phaseId, { count: s.count, avgProgress: s.avgProgress }),
    );
    return map;
  }, [summaryQ.data]);

  function onDragStart(e: DragStartEvent) {
    const id = e.active.id as string;
    setActiveProject((projectsQ.data ?? []).find((p) => p.id === id) ?? null);
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveProject(null);
    const { active, over } = e;
    if (!over) return;
    const dragged = (projectsQ.data ?? []).find((p) => p.id === active.id);
    if (!dragged) return;

    let targetPhaseId = (over.data.current as any)?.phaseId as string | undefined;
    if (!targetPhaseId && phasesQ.data?.find((ph) => ph.id === over.id)) {
      targetPhaseId = over.id as string;
    }
    if (!targetPhaseId) {
      const onProject = (projectsQ.data ?? []).find((p) => p.id === over.id);
      if (onProject) targetPhaseId = onProject.phaseId;
    }
    if (!targetPhaseId) return;

    const list = projectsByPhase.get(targetPhaseId) ?? [];
    let targetIndex = list.length;
    if (over.id !== targetPhaseId) {
      const idx = list.findIndex((p) => p.id === over.id);
      if (idx >= 0) targetIndex = idx;
    }
    if (dragged.phaseId === targetPhaseId && dragged.phaseOrderIndex === targetIndex) return;

    qc.setQueryData<Project[]>(['projects', { boardId: currentBoardId }], (prev) => {
      if (!prev) return prev;
      return prev.map((p) =>
        p.id === dragged.id ? { ...p, phaseId: targetPhaseId!, phaseOrderIndex: targetIndex } : p,
      );
    });

    moveMut.mutate({ id: dragged.id, phaseId: targetPhaseId, order: targetIndex });
  }

  if (boardsQ.isLoading) {
    return <div className="p-8 text-sm text-ink-500">Carregando quadros...</div>;
  }

  if (!currentBoardId) {
    return (
      <div className="grid place-items-center p-16 text-center">
        <FolderKanban className="h-12 w-12 text-ink-300" />
        <h2 className="mt-3 text-base font-semibold text-ink-900">Nenhum quadro de projetos</h2>
        <p className="mt-1 text-sm text-ink-500">
          Crie seu primeiro projeto e um quadro padrão será gerado automaticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-ink-200 px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Projetos</h1>
          <p className="text-sm text-ink-500">
            Acompanhe o pós-venda em um Kanban paralelo aos negócios.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {boardsQ.data && boardsQ.data.length > 1 && (
            <select
              value={currentBoardId}
              onChange={(e) => setBoardId(e.target.value)}
              className="h-9 rounded-md border border-ink-200 bg-white px-2 text-sm"
            >
              {boardsQ.data.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => {
              setNewPhaseId(phasesQ.data?.[0]?.id ?? null);
              setNewOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Novo projeto
          </button>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex h-[calc(100vh-180px)] gap-3 overflow-x-auto p-4">
          {(phasesQ.data ?? []).map((phase) => (
            <ProjectKanbanColumn
              key={phase.id}
              phase={phase}
              projects={projectsByPhase.get(phase.id) ?? []}
              count={summaryByPhase.get(phase.id)?.count ?? 0}
              avgProgress={summaryByPhase.get(phase.id)?.avgProgress ?? 0}
              onAdd={(phaseId) => {
                setNewPhaseId(phaseId);
                setNewOpen(true);
              }}
              onOpen={(p) => setOpenId(p.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeProject ? <ProjectCard project={activeProject} /> : null}
        </DragOverlay>
      </DndContext>

      {newOpen && phasesQ.data && (
        <NewProjectModal
          open
          onClose={() => setNewOpen(false)}
          boardId={currentBoardId}
          phases={phasesQ.data}
          defaultPhaseId={newPhaseId}
        />
      )}

      <ProjectDetailDrawer
        projectId={openId}
        open={openId !== null}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
