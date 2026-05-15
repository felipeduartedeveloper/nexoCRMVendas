import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import {
  HEALTH_LABELS,
  projectsApi,
  type ProjectHealth,
  type ProjectPhase,
} from '@/api/projects.api';
import { extractErrorMessage } from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  boardId: string;
  phases: ProjectPhase[];
  defaultPhaseId?: string | null;
}

export function NewProjectModal({ open, onClose, boardId, phases, defaultPhaseId }: Props) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phaseId, setPhaseId] = useState(defaultPhaseId ?? phases[0]?.id ?? '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [health, setHealth] = useState<ProjectHealth>('ON_TRACK');
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setHealth('ON_TRACK');
    setError(null);
  }

  const mut = useMutation({
    mutationFn: () =>
      projectsApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        health,
        boardId,
        phaseId: phaseId || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['projects-summary'] });
      reset();
      onClose();
    },
    onError: (err) => setError(extractErrorMessage(err, 'Erro ao criar projeto')),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (title.trim().length < 2) {
      setError('Título precisa ter pelo menos 2 caracteres.');
      return;
    }
    setError(null);
    mut.mutate();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg rounded-xl bg-card shadow-elevated"
      >
        <header className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-bold text-foreground">Novo projeto</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-3 p-5">
          <label className="block">
            <span className="field-label">Título *</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={2}
              maxLength={255}
              className="h-9 w-full rounded-md border border-border px-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="field-label">Descrição</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="field-label">Fase</span>
              <select
                value={phaseId}
                onChange={(e) => setPhaseId(e.target.value)}
                className="h-9 w-full rounded-md border border-border px-2 text-sm"
              >
                {phases.map((ph) => (
                  <option key={ph.id} value={ph.id}>
                    {ph.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="field-label">Saúde</span>
              <select
                value={health}
                onChange={(e) => setHealth(e.target.value as ProjectHealth)}
                className="h-9 w-full rounded-md border border-border px-2 text-sm"
              >
                {Object.entries(HEALTH_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="field-label">Início</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 w-full rounded-md border border-border px-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="field-label">Término previsto</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 w-full rounded-md border border-border px-2 text-sm"
              />
            </label>
          </div>

          {error && (
            <div className="rounded-md border border-danger/30 bg-danger/5 p-2 text-sm text-danger">
              {error}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground/80 hover:bg-muted/40"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mut.isPending}
            className="h-9 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {mut.isPending ? 'Salvando...' : 'Criar projeto'}
          </button>
        </footer>
      </form>
    </div>
  );
}
