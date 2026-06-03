import { api, unwrap } from '@/lib/api';
export const dealsApi = {
    list: async (params = {}) => unwrap(await api.get('/deals', { params })),
    kanban: async (pipelineId) => unwrap(await api.get(`/deals/kanban/${pipelineId}`)),
    summary: async (pipelineId) => unwrap(await api.get(`/deals/summary/${pipelineId}`)),
    one: async (id) => unwrap(await api.get(`/deals/${id}`)),
    create: async (data) => unwrap(await api.post('/deals', data)),
    update: async (id, data) => unwrap(await api.patch(`/deals/${id}`, data)),
    move: async (id, data) => unwrap(await api.patch(`/deals/${id}/move`, data)),
    win: async (id) => unwrap(await api.patch(`/deals/${id}/win`)),
    lose: async (id, reason) => unwrap(await api.patch(`/deals/${id}/lose`, { reason })),
    reopen: async (id) => unwrap(await api.patch(`/deals/${id}/reopen`)),
    remove: async (id) => await api.delete(`/deals/${id}`),
};
