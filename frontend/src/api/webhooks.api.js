import { api, unwrap } from '@/lib/api';
export const webhooksApi = {
    list: async () => unwrap(await api.get('/webhooks')),
    one: async (id) => unwrap(await api.get(`/webhooks/${id}`)),
    events: async () => unwrap(await api.get('/webhooks/events')),
    create: async (data) => unwrap(await api.post('/webhooks', data)),
    update: async (id, data) => unwrap(await api.patch(`/webhooks/${id}`, data)),
    setStatus: async (id, status) => unwrap(await api.patch(`/webhooks/${id}/status`, { status })),
    regenerateSecret: async (id) => unwrap(await api.post(`/webhooks/${id}/regenerate-secret`)),
    remove: async (id) => await api.delete(`/webhooks/${id}`),
    test: async (id, event) => unwrap(await api.post(`/webhooks/${id}/test`, { event })),
    deliveries: async (id, page = 1, limit = 50) => unwrap(await api.get(`/webhooks/${id}/deliveries`, { params: { page, limit } })),
};
export function groupEvents(events) {
    const groups = {};
    for (const e of events) {
        const [entity] = e.split('.');
        if (!groups[entity])
            groups[entity] = [];
        groups[entity].push(e);
    }
    return groups;
}
export const ENTITY_LABELS = {
    deal: 'Negócios',
    person: 'Pessoas',
    organization: 'Empresas',
    activity: 'Atividades',
    lead: 'Leads',
};
