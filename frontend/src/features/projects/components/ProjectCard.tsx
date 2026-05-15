import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, GripVertical } from 'lucide-react';
import type { Project } from '@/api/projects.api';
import { HealthBadge } from './HealthBadge';
import { ProgressBar } from './ProgressBar';

interface Props {
  project: Project;
  onOpen?: (project: Project) => void;
}

export function ProjectCard({ project, onOpen }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
    data: { phaseId: project.phaseId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onOpen?.(project)}
      className="group cursor-pointer rounded-lg border border-border bg-card p-3 shadow-card transition-shadow hover:shadow-elevated"
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Arrastar"
          onClick={(e) => e.stopPropagation()}
          className="grid h-5 w-5 cursor-grab place-items-center rounded text-muted-foreground/70 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">{project.title}</h3>
          {project.endDate && (
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(project.endDate).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2">
        <ProgressBar value={project.progress} />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <HealthBadge value={project.health} />
        {project.labels && project.labels.length > 0 && (
          <span className="text-[10px] text-muted-foreground">{project.labels.length} tag(s)</span>
        )}
      </div>
    </div>
  );
}
