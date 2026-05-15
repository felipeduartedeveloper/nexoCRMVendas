import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { activitiesApi, type ActivityType, type ActivityPriority } from '@/api/activities.api';
import { extractErrorMessage } from '@/lib/api';

const TYPES: { value: ActivityType; label: string }[] = [
  { value: 'CALL', label: 'Ligação' },
  { value: 'MEETING', label: 'Reunião' },
  { value: 'TASK', label: 'Tarefa' },
  { value: 'DEADLINE', label: 'Prazo' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'LUNCH', label: 'Almoço' },
];

const PRIORITIES: { value: ActivityPriority; label: string }[] = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NewActivityModal({ open, onClose }: Props) {
  const qc = useQueryClient();
  const [subject, setSubject] = useState('');
  const [type, setType] = useState<ActivityType>('TASK');
  const [priority, setPriority] = useState<ActivityPriority>('MEDIUM');
  const [dueAt, setDueAt] = useState('');
  const [durationMin, setDurationMin] = useState('30');

  const m = useMutation({
    mutationFn: () =>
      activitiesApi.create({
        subject,
        type,
        priority,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
        durationMin: Number(durationMin || 30),
      }),
    onSuccess: async () => {
      toast.success('Atividade criada!');
      await qc.invalidateQueries({ queryKey: ['activities'] });
      await qc.invalidateQueries({ queryKey: ['activities-counters'] });
      reset();
      onClose();
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Falha ao criar.')),
  });

  function reset() {
    setSubject('');
    setType('TASK');
    setPriority('MEDIUM');
    setDueAt('');
    setDurationMin('30');
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error('Informe um assunto.');
      return;
    }
    m.mutate();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-card shadow-elevated">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h3 className="text-lg font-bold text-foreground">Nova atividade</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 p-5">
          <Input
            label="Assunto"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex: Ligação de follow-up"
            autoFocus
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="field-label">Tipo</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ActivityType)}
                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="field-label">Prioridade</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ActivityPriority)}
                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Vencimento"
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
            <Input
              label="Duração (min)"
              type="number"
              min={0}
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={onClose} disabled={m.isPending}>
              Cancelar
            </Button>
            <Button type="submit" loading={m.isPending}>
              Criar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
