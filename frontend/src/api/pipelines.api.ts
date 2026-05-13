import { api, unwrap } from '@/lib/api';

export interface Stage {
  id: string;
  pipelineId: string;
  organizationId: string | null;
  name: string;
  orderIndex: number;
  probability: number;
  color: string;
  isWon: boolean;
  isLost: boolean;
}

export interface Pipeline {
  id: string;
  organizationId: string | null;
  name: string;
  orderIndex: number;
  isDefault: boolean;
  currency: string;
  stages: Stage[];
}

export const pipelinesApi = {
  list: async () => unwrap<Pipeline[]>(await api.get('/pipelines')),
  create: async (data: { name: string; currency?: string; isDefault?: boolean }) =>
    unwrap<Pipeline>(await api.post('/pipelines', data)),
  update: async (id: string, data: Partial<Pipeline>) =>
    unwrap<Pipeline>(await api.patch(`/pipelines/${id}`, data)),
  remove: async (id: string) => await api.delete(`/pipelines/${id}`),
  reorder: async (ids: string[]) =>
    unwrap<Pipeline[]>(await api.post('/pipelines/reorder', { ids })),

  stages: async (id: string) =>
    unwrap<Stage[]>(await api.get(`/pipelines/${id}/stages`)),
  createStage: async (
    pipelineId: string,
    data: { name: string; probability?: number; color?: string; isWon?: boolean; isLost?: boolean },
  ) => unwrap<Stage>(await api.post(`/pipelines/${pipelineId}/stages`, data)),
  updateStage: async (stageId: string, data: Partial<Stage>) =>
    unwrap<Stage>(await api.patch(`/pipelines/stages/${stageId}`, data)),
  removeStage: async (stageId: string) =>
    await api.delete(`/pipelines/stages/${stageId}`),
  reorderStages: async (pipelineId: string, ids: string[]) =>
    unwrap<Stage[]>(await api.post(`/pipelines/${pipelineId}/stages/reorder`, { ids })),
};
