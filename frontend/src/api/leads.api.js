import { api, unwrap } from '@/lib/api';
export const leadsApi = {
    list: async (params = {}) => unwrap(await api.get('/leads', { params })),
    counters: async () => unwrap(await api.get('/leads/counters')),
    one: async (id) => unwrap(await api.get(`/leads/${id}`)),
    create: async (data) => unwrap(await api.post('/leads', data)),
    update: async (id, data) => unwrap(await api.patch(`/leads/${id}`, data)),
    archive: async (id) => unwrap(await api.patch(`/leads/${id}/archive`)),
    convert: async (id, data = {}) => unwrap(await api.post(`/leads/${id}/convert`, data)),
    remove: async (id) => await api.delete(`/leads/${id}`),
};
