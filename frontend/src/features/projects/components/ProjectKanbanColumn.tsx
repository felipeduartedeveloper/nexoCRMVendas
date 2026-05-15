import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { Project, ProjectPhase } from '@/api/projects.api';
import { ProjectCard } from './ProjectCard';

interface Props {
  phase: ProjectPhase;
  projects: Project[];
  count: number;
  avgProgress: number;
  onAdd: (phaseId: string) => void;
  onOpen: (project: Project) => void;
}

export function ProjectKanbanColumn({
  phase,
  projects,
  count,
  avgProgress,
  onAdd,
  onOpen,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: phase.id,
    data: { phaseId: phase.id },
  });

  return (
    <div className="flex w-[300px] flex-shrink-0 flex-col rounded-xl bg-muted/40">
      <header className="rounded-t-xl bg-card px-3 py-2.5" style={{ borderTop: `3px solid ${phase.color}` }}>
        <div className="flex items-center justify-between">
          <h3 className="truncate text-sm font-bold text-foreground">{phase.name}</h3>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
            {count}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Progresso médio · {avgProgress}%</p>
      </header>

      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 overflow-y-auto p-2 transition-colors ${
          isOver ? 'bg-brand-50' : ''
        }`}
      >
        <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onOpen={onOpen} />
          ))}
        </SortableContext>
        {projects.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-4 text-center text-[11px] text-muted-foreground/70">
            Arraste projetos para cá
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onAdd(phase.id)}
        className="m-2 rounded-md border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        + Adicionar projeto
      </button>
    </div>
  );
}
