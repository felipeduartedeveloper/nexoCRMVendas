import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import {
  HEALTH_LABELS,
  projectsApi,
  STATUS_LABELS,
  type ProjectHealth,
} from '@/api/projects.api';
import { HealthBadge } from './HealthBadge';
import { ProgressBar } from './ProgressBar';

interface Props {
  projectId: string | null;
  open: boolean;
  onClose: () => void;
}

type Tab = 'overview' | 'tasks' | 'deals';

export function ProjectDetailDrawer({ projectId, open, onClose }: Props) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [health, setHealth] = useState<ProjectHealth>('ON_TRACK');
  const [endDate, setEndDate] = useState('');
  const [editing, setEditing] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const { data: project } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectsApi.one(projectId!),
    enabled: !!projectId && open,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => projectsApi.listTasks(projectId!),
    enabled: !!projectId && open && tab === 'tasks',
  });

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description ?? '');
      setHealth(project.health);
      setEndDate(project.endDate ?? '');
      setEditing(false);
      setTab('overview');
    }
  }, [project?.id]);

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['projects'] });
    qc.invalidateQueries({ queryKey: ['projects-summary'] });
    qc.invalidateQueries({ queryKey: ['project-tasks', projectId] });
  }

  const updateMut = useMutation({
    mutationFn: () =>
      projectsApi.update(projectId!, {
        title: title.trim(),
        description: description.trim() || null,
        health,
        endDate: endDate || null,
      }),
    onSuccess: () => {
      invalidate();
      setEditing(false);
    },
  });

  const completeMut = useMutation({
    mutationFn: () => projectsApi.complete(projectId!),
    onSuccess: () => invalidate(),
  });

  const archiveMut = useMutation({
    mutationFn: () => projectsApi.archive(projectId!),
    onSuccess: () => {
      invalidate();
      onClose();
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => projectsApi.remove(projectId!),
    onSuccess: () => {
      invalidate();
      onClose();
    },
  });

  const newTaskMut = useMutation({
    mutationFn: () => projectsApi.createTask(projectId!, { title: newTaskTitle.trim() }),
    onSuccess: () => {
      setNewTaskTitle('');
      invalidate();
    },
  });

  const toggleTaskMut = useMutation({
    mutationFn: (id: string) => projectsApi.toggleTaskDone(id),
    onSuccess: () => invalidate(),
  });

  const deleteTaskMut = useMutation({
    mutationFn: (id: string) => projectsApi.deleteTask(id),
    onSuccess: () => invalidate(),
  });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="lg"
      title={
        <div className="flex items-center gap-2">
          <span className="truncate">{project?.title ?? 'Projeto'}</span>
          {project && (
            <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-600">
              {STATUS_LABELS[project.status]}
            </span>
          )}
        </div>
      }
      headerActions={
        project &&
        project.status === 'OPEN' && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => completeMut.mutate()}
              title="Concluir"
              className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-semibold text-success hover:bg-success/20"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
            </button>
            <button
              type="button"
              onClick={() => archiveMut.mutate()}
              className="rounded-md px-2 py-1 text-xs font-medium text-ink-700 hover:bg-ink-100"
            >
              Arquivar
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Apagar projeto?')) deleteMut.mutate();
              }}
              aria-label="Apagar"
              className="grid h-8 w-8 place-items-center rounded-md text-ink-500 hover:bg-ink-100 hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      }
    >
      {project && (
        <div className="flex h-full flex-col">
          <nav className="flex gap-1 border-b border-ink-200 px-5">
            {(
              [
                ['overview', 'Visão geral'],
                ['tasks', 'Tarefas'],
                ['deals', 'Negócios vinculados'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`relative px-3 py-2.5 text-sm font-medium transition-colors ${
                  tab === k ? 'text-brand-700' : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                {label}
                {tab === k && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600" />
                )}
              </button>
            ))}
          </nav>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {tab === 'overview' && (
              <>
                <div className="rounded-lg border border-ink-200 p-3">
                  <ProgressBar value={project.progress} />
                  <div className="mt-2 flex justify-between text-xs">
                    <HealthBadge value={project.health} />
                    {project.endDate && (
                      <span className="text-ink-500">
                        Prevista: {new Date(project.endDate).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Título" value={title} onChange={setTitle} editing={editing} />
                  <SelectField
                    label="Saúde"
                    value={health}
                    onChange={(v) => setHealth(v as ProjectHealth)}
                    options={Object.entries(HEALTH_LABELS).map(([k, v]) => ({ value: k, label: v }))}
                    editing={editing}
                  />
                  <Field
                    label="Término previsto"
                    value={endDate}
                    onChange={setEndDate}
                    editing={editing}
                    type="date"
                  />
                  <div>
                    <span className="field-label">Criado em</span>
                    <div className="text-sm text-ink-900">
                      {new Date(project.createdAt).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Field
                      label="Descrição"
                      value={description}
                      onChange={setDescription}
                      editing={editing}
                      textarea
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-ink-200 pt-4">
                  {!editing ? (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="h-9 rounded-md border border-ink-200 bg-white px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
                    >
                      Editar
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="h-9 rounded-md border border-ink-200 bg-white px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => updateMut.mutate()}
                        disabled={updateMut.isPending}
                        className="h-9 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                      >
                        {updateMut.isPending ? 'Salvando...' : 'Salvar'}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {tab === 'tasks' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTaskTitle.trim()) {
                        e.preventDefault();
                        newTaskMut.mutate();
                      }
                    }}
                    placeholder="Nova tarefa..."
                    className="h-9 flex-1 rounded-md border border-ink-200 px-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => newTaskMut.mutate()}
                    disabled={!newTaskTitle.trim() || newTaskMut.isPending}
                    className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" /> Adicionar
                  </button>
                </div>
                {tasks.length === 0 && (
                  <p className="py-4 text-center text-sm text-ink-500">Sem tarefas ainda.</p>
                )}
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 rounded-md border border-ink-200 p-2"
                  >
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggleTaskMut.mutate(t.id)}
                      className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span
                      className={`flex-1 text-sm ${
                        t.done ? 'text-ink-400 line-through' : 'text-ink-900'
                      }`}
                    >
                      {t.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteTaskMut.mutate(t.id)}
                      className="grid h-7 w-7 place-items-center rounded text-ink-400 hover:bg-ink-100 hover:text-danger"
                      aria-label="Apagar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tab === 'deals' && (
              <div className="rounded-lg border border-dashed border-ink-200 p-6 text-center text-sm text-ink-600">
                Vinculação a negócios estará disponível em breve.
                <br />
                Endpoint: <code>POST /projects/:id/deal-links</code>
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}

function Field({
  label,
  value,
  onChange,
  editing,
  textarea,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <div>
      <span className="field-label">{label}</span>
      {editing ? (
        textarea ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-ink-200 px-2 py-1.5 text-sm"
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-full rounded-md border border-ink-200 px-2 text-sm"
          />
        )
      ) : (
        <div className="text-sm text-ink-900">{value || '—'}</div>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  editing,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  editing: boolean;
}) {
  if (!editing) {
    return (
      <div>
        <span className="field-label">{label}</span>
        <div className="text-sm text-ink-900">
          {options.find((o) => o.value === value)?.label ?? '—'}
        </div>
      </div>
    );
  }
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-ink-200 px-2 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
