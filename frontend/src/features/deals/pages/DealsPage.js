import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, PointerSensor, useSensor, useSensors, closestCorners, DragOverlay, } from '@dnd-kit/core';
import toast from 'react-hot-toast';
import { Plus, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { PipelinesReadyBanner } from '../components/PipelinesReadyBanner';
import { KanbanColumn } from '../components/KanbanColumn';
import { DealCard } from '../components/DealCard';
import { NewDealModal } from '../components/NewDealModal';
import { DealDetailDrawer } from '../components/DealDetailDrawer';
import { pipelinesApi } from '@/api/pipelines.api';
import { dealsApi } from '@/api/deals.api';
import { formatMoney } from '@/lib/format';
import { extractErrorMessage } from '@/lib/api';
export function DealsPage() {
    const qc = useQueryClient();
    const [selectedPipelineId, setSelectedPipelineId] = useState(null);
    const [activeDeal, setActiveDeal] = useState(null);
    const [newDealOpen, setNewDealOpen] = useState(false);
    const [newDealStageId, setNewDealStageId] = useState(null);
    const [openDealId, setOpenDealId] = useState(null);
    const pipelinesQ = useQuery({
        queryKey: ['pipelines'],
        queryFn: pipelinesApi.list,
    });
    const pipeline = useMemo(() => {
        if (!pipelinesQ.data?.length)
            return null;
        const found = pipelinesQ.data.find((p) => p.id === selectedPipelineId) ??
            pipelinesQ.data.find((p) => p.isDefault) ??
            pipelinesQ.data[0];
        return found;
    }, [pipelinesQ.data, selectedPipelineId]);
    const dealsQ = useQuery({
        queryKey: ['deals', 'kanban', pipeline?.id],
        queryFn: () => dealsApi.kanban(pipeline.id),
        enabled: !!pipeline,
    });
    const summaryQ = useQuery({
        queryKey: ['deals-summary', pipeline?.id],
        queryFn: () => dealsApi.summary(pipeline.id),
        enabled: !!pipeline,
    });
    const moveMutation = useMutation({
        mutationFn: (input) => dealsApi.move(input.id, { stageId: input.stageId, stageOrderIndex: input.stageOrderIndex }),
        onSuccess: async () => {
            if (!pipeline)
                return;
            await qc.invalidateQueries({ queryKey: ['deals', 'kanban', pipeline.id] });
            await qc.invalidateQueries({ queryKey: ['deals-summary', pipeline.id] });
        },
        onError: (err) => toast.error(extractErrorMessage(err, 'Falha ao mover deal.')),
    });
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
    const dealsByStage = useMemo(() => {
        const map = new Map();
        if (!pipeline)
            return map;
        pipeline.stages.forEach((s) => map.set(s.id, []));
        (dealsQ.data ?? []).forEach((d) => {
            if (!map.has(d.stageId))
                map.set(d.stageId, []);
            map.get(d.stageId).push(d);
        });
        map.forEach((list) => list.sort((a, b) => a.stageOrderIndex - b.stageOrderIndex));
        return map;
    }, [pipeline, dealsQ.data]);
    const summaryByStage = useMemo(() => {
        const map = new Map();
        (summaryQ.data ?? []).forEach((s) => map.set(s.stageId, { count: s.count, total: s.total }));
        return map;
    }, [summaryQ.data]);
    const totalValue = useMemo(() => (summaryQ.data ?? []).reduce((acc, r) => acc + (r.total ?? 0), 0), [summaryQ.data]);
    const totalCount = useMemo(() => (summaryQ.data ?? []).reduce((acc, r) => acc + (r.count ?? 0), 0), [summaryQ.data]);
    function onDragStart(e) {
        const id = e.active.id;
        setActiveDeal((dealsQ.data ?? []).find((d) => d.id === id) ?? null);
    }
    function onDragEnd(e) {
        setActiveDeal(null);
        const { active, over } = e;
        if (!over || !pipeline)
            return;
        const activeId = active.id;
        const dragged = (dealsQ.data ?? []).find((d) => d.id === activeId);
        if (!dragged)
            return;
        let targetStageId = over.data.current?.stageId;
        if (!targetStageId && pipeline.stages.find((s) => s.id === over.id)) {
            targetStageId = over.id;
        }
        if (!targetStageId) {
            const droppedOnDeal = (dealsQ.data ?? []).find((d) => d.id === over.id);
            if (droppedOnDeal)
                targetStageId = droppedOnDeal.stageId;
        }
        if (!targetStageId)
            return;
        const targetList = dealsByStage.get(targetStageId) ?? [];
        let targetIndex = targetList.length;
        if (over.id !== targetStageId) {
            const idx = targetList.findIndex((d) => d.id === over.id);
            if (idx >= 0)
                targetIndex = idx;
        }
        if (dragged.stageId === targetStageId && dragged.stageOrderIndex === targetIndex)
            return;
        qc.setQueryData(['deals', 'kanban', pipeline.id], (prev) => {
            if (!prev)
                return prev;
            const without = prev.filter((d) => d.id !== dragged.id);
            const updated = { ...dragged, stageId: targetStageId, stageOrderIndex: targetIndex };
            const targetItems = without
                .filter((d) => d.stageId === targetStageId)
                .map((d) => d.stageOrderIndex >= targetIndex
                ? { ...d, stageOrderIndex: d.stageOrderIndex + 1 }
                : d);
            const others = without.filter((d) => d.stageId !== targetStageId);
            return [...others, ...targetItems, updated];
        });
        moveMutation.mutate({ id: dragged.id, stageId: targetStageId, stageOrderIndex: targetIndex });
    }
    if (pipelinesQ.isLoading) {
        return (_jsx("div", { className: "flex h-72 items-center justify-center", children: _jsx(Spinner, { label: "Carregando pipelines\u2026" }) }));
    }
    if (!pipeline) {
        return (_jsxs("div", { className: "mx-auto max-w-7xl", children: [_jsx(PageHeader, { title: "Neg\u00F3cios" }), _jsx("div", { className: "grid place-items-center rounded-xl border border-dashed border-border bg-card p-12 text-center", children: _jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum pipeline configurado ainda." }) })] }));
    }
    return (_jsxs("div", { className: "mx-auto max-w-[1600px]", children: [_jsx(PageHeader, { title: "Neg\u00F3cios", subtitle: `${totalCount} deals · ${formatMoney(totalValue, pipeline.currency)}`, actions: _jsxs(_Fragment, { children: [_jsxs(Button, { variant: "outline", size: "md", children: [_jsx(Filter, { className: "h-4 w-4" }), " Filtros"] }), _jsxs(Button, { onClick: () => {
                                setNewDealStageId(pipeline.stages[0]?.id ?? null);
                                setNewDealOpen(true);
                            }, children: [_jsx(Plus, { className: "h-4 w-4" }), " Novo neg\u00F3cio"] })] }) }), _jsx("div", { className: "mb-4 flex items-center gap-2", children: _jsx(PipelineSelector, { value: pipeline.id, pipelines: pipelinesQ.data ?? [], onChange: setSelectedPipelineId }) }), _jsx(PipelinesReadyBanner, {}), _jsxs(DndContext, { sensors: sensors, collisionDetection: closestCorners, onDragStart: onDragStart, onDragEnd: onDragEnd, children: [_jsx("div", { className: "flex h-[calc(100vh-280px)] gap-3 overflow-x-auto pb-2", children: pipeline.stages.map((stage) => {
                            const list = dealsByStage.get(stage.id) ?? [];
                            const summary = summaryByStage.get(stage.id);
                            return (_jsx(KanbanColumn, { stage: stage, deals: list, count: summary?.count ?? list.length, total: summary?.total ?? list.reduce((a, b) => a + Number(b.value || 0), 0), currency: pipeline.currency, onAddDeal: (stageId) => {
                                    setNewDealStageId(stageId);
                                    setNewDealOpen(true);
                                }, onSelectDeal: (deal) => setOpenDealId(deal.id) }, stage.id));
                        }) }), _jsx(DragOverlay, { children: activeDeal ? _jsx(DealCard, { deal: activeDeal }) : null })] }), newDealOpen && (_jsx(NewDealModal, { open: true, pipeline: pipeline, defaultStage: pipeline.stages.find((s) => s.id === newDealStageId) ?? pipeline.stages[0], onClose: () => setNewDealOpen(false) })), _jsx(DealDetailDrawer, { open: !!openDealId, dealId: openDealId, pipeline: pipeline, onClose: () => setOpenDealId(null) })] }));
}
function PipelineSelector({ value, pipelines, onChange, }) {
    if (pipelines.length <= 1)
        return null;
    return (_jsxs("div", { className: "relative", children: [_jsx("select", { value: value, onChange: (e) => onChange(e.target.value), className: "appearance-none rounded-lg border border-border bg-card py-1.5 pl-3 pr-8 text-sm font-semibold text-foreground focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100", children: pipelines.map((p) => (_jsxs("option", { value: p.id, children: ["Pipeline \u00B7 ", p.name] }, p.id))) }), _jsx(ChevronDown, { className: "pointer-events-none absolute right-2 top-2 h-4 w-4 text-muted-foreground" })] }));
}
