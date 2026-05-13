import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import toast from 'react-hot-toast';
import { Plus, Filter, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { PipelinesReadyBanner } from '../components/PipelinesReadyBanner';
import { KanbanColumn } from '../components/KanbanColumn';
import { DealCard } from '../components/DealCard';
import { NewDealModal } from '../components/NewDealModal';

import { pipelinesApi, type Pipeline } from '@/api/pipelines.api';
import { dealsApi, type Deal } from '@/api/deals.api';
import { formatMoney } from '@/lib/format';
import { extractErrorMessage } from '@/lib/api';

export function DealsPage() {
  const qc = useQueryClient();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [newDealOpen, setNewDealOpen] = useState(false);
  const [newDealStageId, setNewDealStageId] = useState<string | null>(null);

  const pipelinesQ = useQuery({
    queryKey: ['pipelines'],
    queryFn: pipelinesApi.list,
  });

  const pipeline = useMemo<Pipeline | null>(() => {
    if (!pipelinesQ.data?.length) return null;
    const found =
      pipelinesQ.data.find((p) => p.id === selectedPipelineId) ??
      pipelinesQ.data.find((p) => p.isDefault) ??
      pipelinesQ.data[0];
    return found;
  }, [pipelinesQ.data, selectedPipelineId]);

  const dealsQ = useQuery({
    queryKey: ['deals', 'kanban', pipeline?.id],
    queryFn: () => dealsApi.kanban(pipeline!.id),
    enabled: !!pipeline,
  });

  const summaryQ = useQuery({
    queryKey: ['deals-summary', pipeline?.id],
    queryFn: () => dealsApi.summary(pipeline!.id),
    enabled: !!pipeline,
  });

  const moveMutation = useMutation({
    mutationFn: (input: { id: string; stageId: string; stageOrderIndex: number }) =>
      dealsApi.move(input.id, { stageId: input.stageId, stageOrderIndex: input.stageOrderIndex }),
    onSuccess: async () => {
      if (!pipeline) return;
      await qc.invalidateQueries({ queryKey: ['deals', 'kanban', pipeline.id] });
      await qc.invalidateQueries({ queryKey: ['deals-summary', pipeline.id] });
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Falha ao mover deal.')),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const dealsByStage = useMemo(() => {
    const map = new Map<string, Deal[]>();
    if (!pipeline) return map;
    pipeline.stages.forEach((s) => map.set(s.id, []));
    (dealsQ.data ?? []).forEach((d) => {
      if (!map.has(d.stageId)) map.set(d.stageId, []);
      map.get(d.stageId)!.push(d);
    });
    map.forEach((list) => list.sort((a, b) => a.stageOrderIndex - b.stageOrderIndex));
    return map;
  }, [pipeline, dealsQ.data]);

  const summaryByStage = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    (summaryQ.data ?? []).forEach((s) => map.set(s.stageId, { count: s.count, total: s.total }));
    return map;
  }, [summaryQ.data]);

  const totalValue = useMemo(
    () => (summaryQ.data ?? []).reduce((acc, r) => acc + (r.total ?? 0), 0),
    [summaryQ.data],
  );
  const totalCount = useMemo(
    () => (summaryQ.data ?? []).reduce((acc, r) => acc + (r.count ?? 0), 0),
    [summaryQ.data],
  );

  function onDragStart(e: DragStartEvent) {
    const id = e.active.id as string;
    setActiveDeal((dealsQ.data ?? []).find((d) => d.id === id) ?? null);
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveDeal(null);
    const { active, over } = e;
    if (!over || !pipeline) return;
    const activeId = active.id as string;
    const dragged = (dealsQ.data ?? []).find((d) => d.id === activeId);
    if (!dragged) return;

    let targetStageId = (over.data.current as any)?.stageId as string | undefined;
    if (!targetStageId && pipeline.stages.find((s) => s.id === over.id)) {
      targetStageId = over.id as string;
    }
    if (!targetStageId) {
      const droppedOnDeal = (dealsQ.data ?? []).find((d) => d.id === over.id);
      if (droppedOnDeal) targetStageId = droppedOnDeal.stageId;
    }
    if (!targetStageId) return;

    const targetList = dealsByStage.get(targetStageId) ?? [];
    let targetIndex = targetList.length;
    if (over.id !== targetStageId) {
      const idx = targetList.findIndex((d) => d.id === over.id);
      if (idx >= 0) targetIndex = idx;
    }

    if (dragged.stageId === targetStageId && dragged.stageOrderIndex === targetIndex) return;

    qc.setQueryData<Deal[]>(['deals', 'kanban', pipeline.id], (prev) => {
      if (!prev) return prev;
      const without = prev.filter((d) => d.id !== dragged.id);
      const updated: Deal = { ...dragged, stageId: targetStageId!, stageOrderIndex: targetIndex };
      const targetItems = without
        .filter((d) => d.stageId === targetStageId)
        .map((d) =>
          d.stageOrderIndex >= targetIndex
            ? { ...d, stageOrderIndex: d.stageOrderIndex + 1 }
            : d,
        );
      const others = without.filter((d) => d.stageId !== targetStageId);
      return [...others, ...targetItems, updated];
    });

    moveMutation.mutate({ id: dragged.id, stageId: targetStageId, stageOrderIndex: targetIndex });
  }

  if (pipelinesQ.isLoading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Spinner label="Carregando pipelines…" />
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader title="Negócios" />
        <div className="grid place-items-center rounded-xl border border-dashed border-ink-300 bg-white p-12 text-center">
          <p className="text-sm text-ink-600">Nenhum pipeline configurado ainda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Negócios"
        subtitle={`${totalCount} deals · ${formatMoney(totalValue, pipeline.currency)}`}
        actions={
          <>
            <Button variant="outline" size="md">
              <Filter className="h-4 w-4" /> Filtros
            </Button>
            <Button
              onClick={() => {
                setNewDealStageId(pipeline.stages[0]?.id ?? null);
                setNewDealOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Novo negócio
            </Button>
          </>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <PipelineSelector
          value={pipeline.id}
          pipelines={pipelinesQ.data ?? []}
          onChange={setSelectedPipelineId}
        />
      </div>

      <PipelinesReadyBanner />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex h-[calc(100vh-280px)] gap-3 overflow-x-auto pb-2">
          {pipeline.stages.map((stage) => {
            const list = dealsByStage.get(stage.id) ?? [];
            const summary = summaryByStage.get(stage.id);
            return (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                deals={list}
                count={summary?.count ?? list.length}
                total={summary?.total ?? list.reduce((a, b) => a + Number(b.value || 0), 0)}
                currency={pipeline.currency}
                onAddDeal={(stageId) => {
                  setNewDealStageId(stageId);
                  setNewDealOpen(true);
                }}
                onSelectDeal={() => {
                  // drawer Pipedrive virá no pacote A9
                }}
              />
            );
          })}
        </div>

        <DragOverlay>{activeDeal ? <DealCard deal={activeDeal} /> : null}</DragOverlay>
      </DndContext>

      {newDealOpen && (
        <NewDealModal
          open
          pipeline={pipeline}
          defaultStage={
            pipeline.stages.find((s) => s.id === newDealStageId) ?? pipeline.stages[0]
          }
          onClose={() => setNewDealOpen(false)}
        />
      )}
    </div>
  );
}

function PipelineSelector({
  value,
  pipelines,
  onChange,
}: {
  value: string;
  pipelines: Pipeline[];
  onChange: (id: string) => void;
}) {
  if (pipelines.length <= 1) return null;
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-ink-300 bg-white py-1.5 pl-3 pr-8 text-sm font-semibold text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      >
        {pipelines.map((p) => (
          <option key={p.id} value={p.id}>
            Pipeline · {p.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-ink-500" />
    </div>
  );
}
