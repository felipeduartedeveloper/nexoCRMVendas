import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { dealsApi } from '@/api/deals.api';
import { extractErrorMessage } from '@/lib/api';
import type { Pipeline, Stage } from '@/api/pipelines.api';

interface Props {
  open: boolean;
  pipeline: Pipeline;
  defaultStage: Stage;
  onClose: () => void;
}

export function NewDealModal({ open, pipeline, defaultStage, onClose }: Props) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [stageId, setStageId] = useState(defaultStage.id);

  const m = useMutation({
    mutationFn: () =>
      dealsApi.create({
        title,
        pipelineId: pipeline.id,
        stageId,
        value: value ? Number(value) : 0,
        currency: pipeline.currency,
      }),
    onSuccess: async () => {
      toast.success('Negócio criado!');
      await qc.invalidateQueries({ queryKey: ['deals'] });
      await qc.invalidateQueries({ queryKey: ['deals-summary', pipeline.id] });
      reset();
      onClose();
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Falha ao criar.')),
  });

  function reset() {
    setTitle('');
    setValue('');
    setStageId(defaultStage.id);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Informe um título.');
      return;
    }
    m.mutate();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-card shadow-elevated">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h3 className="text-lg font-bold text-foreground">Novo negócio</h3>
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
            label="Título"
            placeholder="Ex: Proposta site institucional"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
          <Input
            label={`Valor (${pipeline.currency})`}
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
          />
          <div>
            <span className="field-label">Etapa</span>
            <select
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              {pipeline.stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={onClose} disabled={m.isPending}>
              Cancelar
            </Button>
            <Button type="submit" loading={m.isPending}>
              Criar negócio
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
