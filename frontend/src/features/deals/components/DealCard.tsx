import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Building2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import type { Deal } from '@/api/deals.api';

interface Props {
  deal: Deal;
  onClick?: () => void;
}

export function DealCard({ deal, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { type: 'deal', stageId: deal.stageId },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group rounded-lg border bg-white p-3 shadow-card transition-shadow',
        'hover:border-brand-300 hover:shadow-elevated',
        isDragging
          ? 'border-brand-500 opacity-50 ring-2 ring-brand-200'
          : 'border-ink-200',
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab touch-none text-ink-300 hover:text-ink-500 active:cursor-grabbing"
          aria-label="Arrastar deal"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onClick}
          className="flex-1 text-left"
        >
          <div className="line-clamp-2 text-sm font-semibold text-ink-900">
            {deal.title}
          </div>
          {deal.orgCompanyId && (
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-ink-500">
              <Building2 className="h-3 w-3" />
              Empresa associada
            </div>
          )}
          <div className="mt-2 inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-bold text-success">
            {formatMoney(deal.value, deal.currency)}
          </div>
        </button>
      </div>
    </div>
  );
}
