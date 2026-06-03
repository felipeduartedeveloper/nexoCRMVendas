import { api, unwrap } from '@/lib/api';
export const activitiesApi = {
    list: async (params = {}) => unwrap(await api.get('/activities', {
        params: {
            ...params,
            done: params.done === undefined ? undefined : String(params.done),
        },
    })),
    counters: async () => unwrap(await api.get('/activities/counters')),
    one: async (id) => unwrap(await api.get(`/activities/${id}`)),
    create: async (data) => unwrap(await api.post('/activities', data)),
    update: async (id, data) => unwrap(await api.patch(`/activities/${id}`, data)),
    markDone: async (id, done) => unwrap(await api.patch(`/activities/${id}/done`, { done })),
    remove: async (id) => await api.delete(`/activities/${id}`),
};
