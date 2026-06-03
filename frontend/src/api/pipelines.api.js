import { api, unwrap } from '@/lib/api';
export const pipelinesApi = {
    list: async () => unwrap(await api.get('/pipelines')),
    create: async (data) => unwrap(await api.post('/pipelines', data)),
    update: async (id, data) => unwrap(await api.patch(`/pipelines/${id}`, data)),
    remove: async (id) => await api.delete(`/pipelines/${id}`),
    reorder: async (ids) => unwrap(await api.post('/pipelines/reorder', { ids })),
    stages: async (id) => unwrap(await api.get(`/pipelines/${id}/stages`)),
    createStage: async (pipelineId, data) => unwrap(await api.post(`/pipelines/${pipelineId}/stages`, data)),
    updateStage: async (stageId, data) => unwrap(await api.patch(`/pipelines/stages/${stageId}`, data)),
    removeStage: async (stageId) => await api.delete(`/pipelines/stages/${stageId}`),
    reorderStages: async (pipelineId, ids) => unwrap(await api.post(`/pipelines/${pipelineId}/stages/reorder`, { ids })),
};
