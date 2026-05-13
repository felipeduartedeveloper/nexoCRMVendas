import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import { DealCard } from './DealCard';
import type { Deal } from '@/api/deals.api';
import type { Stage } from '@/api/pipelines.api';

interface Props {
  stage: Stage;
  deals: Deal[];
  total: number;
  count: number;
  currency: string;
  onAddDeal?: (stageId: string) => void;
  onSelectDeal?: (deal: Deal) => void;
}

export function KanbanColumn({
  stage,
  deals,
  total,
  count,
  currency,
  onAddDeal,
  onSelectDeal,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: 'column', stageId: stage.id },
  });

  return (
    <div className="flex h-full w-72 shrink-0 flex-col">
      <div
        className={cn(
          'mb-2 rounded-t-lg border-b-2 bg-white p-3 transition-colors',
          stage.isWon
            ? 'border-success'
            : stage.isLost
            ? 'border-danger'
            : 'border-brand-500',
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-ink-900">
            {stage.name}
          </span>
          <button
            type="button"
            onClick={() => onAddDeal?.(stage.id)}
            className="grid h-6 w-6 place-items-center rounded text-ink-400 hover:bg-ink-100 hover:text-ink-900"
            aria-label="Novo deal nesta etapa"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-ink-500">
          <span className="font-semibold text-ink-700">{formatMoney(total, currency)}</span>
          <span>
            {count} {count === 1 ? 'deal' : 'deals'}
          </span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-2 overflow-y-auto rounded-b-lg bg-ink-50 p-2 transition-colors',
          isOver && 'bg-brand-50 ring-2 ring-inset ring-brand-300',
        )}
      >
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.length === 0 ? (
            <div className="grid h-24 place-items-center rounded-lg border border-dashed border-ink-300 text-xs text-ink-400">
              Arraste um deal aqui
            </div>
          ) : (
            deals.map((d) => (
              <DealCard key={d.id} deal={d} onClick={() => onSelectDeal?.(d)} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
