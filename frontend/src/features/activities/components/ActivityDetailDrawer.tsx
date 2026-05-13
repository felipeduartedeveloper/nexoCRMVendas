import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CheckCircle2, Trash2, Calendar, Flag } from 'lucide-react';

import { Drawer } from '@/components/ui/Drawer';
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

interface Props {
  open: boolean;
  activityId: string | null;
  onClose: () => void;
}

export function ActivityDetailDrawer({ open, activityId, onClose }: Props) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['activity', activityId],
    queryFn: () => activitiesApi.one(activityId!),
    enabled: open && !!activityId,
  });

  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<ActivityType>('TASK');
  const [priority, setPriority] = useState<ActivityPriority>('MEDIUM');
  const [dueAt, setDueAt] = useState('');

  useEffect(() => {
    const a = q.data;
    if (a) {
      setSubject(a.subject);
      setNotes(a.notes ?? '');
      setType(a.type);
      setPriority(a.priority);
      setDueAt(a.dueAt ? a.dueAt.slice(0, 16) : '');
    }
  }, [q.data?.id]);

  const update = useMutation({
    mutationFn: (data: any) => activitiesApi.update(activityId!, data),
    onSuccess: async () => {
      toast.success('Salvo!');
      await qc.invalidateQueries({ queryKey: ['activity', activityId] });
      await qc.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const toggle = useMutation({
    mutationFn: () => activitiesApi.markDone(activityId!, !q.data?.done),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['activity', activityId] });
      await qc.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: () => activitiesApi.remove(activityId!),
    onSuccess: async () => {
      toast.success('Atividade removida.');
      onClose();
      await qc.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const a = q.data;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="md"
      title={a ? a.subject : 'Carregando…'}
      subtitle={
        a && (
          <span className="text-xs text-ink-500">
            {a.dueAt ? new Date(a.dueAt).toLocaleString('pt-BR') : 'Sem prazo'} ·{' '}
            {a.durationMin} min
          </span>
        )
      }
      headerActions={
        a && (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={a.done ? 'outline' : 'primary'}
              onClick={() => toggle.mutate()}
              loading={toggle.isPending}
            >
              <CheckCircle2 className="h-4 w-4" />
              {a.done ? 'Reabrir' : 'Concluir'}
            </Button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Apagar esta atividade?')) remove.mutate();
              }}
              className="grid h-8 w-8 place-items-center rounded-lg text-danger hover:bg-red-50"
              aria-label="Apagar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      }
    >
      {!a ? (
        <div className="p-8 text-center text-sm text-ink-500">Carregando…</div>
      ) : (
        <div className="space-y-4 p-5">
          <Input
            label="Assunto"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onBlur={() => subject !== a.subject && subject && update.mutate({ subject })}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="field-label">Tipo</span>
              <select
                value={type}
                onChange={(e) => {
                  const v = e.target.value as ActivityType;
                  setType(v);
                  update.mutate({ type: v });
                }}
                className="h-10 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
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
                onChange={(e) => {
                  const v = e.target.value as ActivityPriority;
                  setPriority(v);
                  update.mutate({ priority: v });
                }}
                className="h-10 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
              </select>
            </div>
          </div>
          <Input
            label="Vencimento"
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            onBlur={() => {
              const iso = dueAt ? new Date(dueAt).toISOString() : null;
              if (iso !== a.dueAt) update.mutate({ dueAt: iso });
            }}
            leftSlot={<Calendar className="h-4 w-4" />}
          />
          <div>
            <span className="field-label">Notas</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => notes !== (a.notes ?? '') && update.mutate({ notes: notes || null })}
              rows={5}
              className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="Adicione notas sobre esta atividade…"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-ink-500">
            <div>
              <Flag className="mr-1 inline h-3 w-3" />
              Criada em {new Date(a.createdAt).toLocaleString('pt-BR')}
            </div>
            <div>Atualizada em {new Date(a.updatedAt).toLocaleString('pt-BR')}</div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
