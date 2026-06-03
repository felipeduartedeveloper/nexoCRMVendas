import { api, unwrap } from '@/lib/api';
export const contactsApi = {
    list: async (params = {}) => unwrap(await api.get('/contacts', { params })),
    timeline: async () => unwrap(await api.get('/contacts/timeline')),
    duplicates: async () => unwrap(await api.get('/contacts/duplicates')),
    one: async (id) => unwrap(await api.get(`/contacts/${id}`)),
    create: async (data) => unwrap(await api.post('/contacts', data)),
    update: async (id, data) => unwrap(await api.patch(`/contacts/${id}`, data)),
    remove: async (id) => await api.delete(`/contacts/${id}`),
    merge: async (targetId, sourceIds) => unwrap(await api.post('/contacts/merge', { targetId, sourceIds })),
    bulkDelete: async (ids) => unwrap(await api.post('/contacts/bulk-delete', { ids })),
};
export const companiesApi = {
    list: async (params = {}) => unwrap(await api.get('/companies', { params })),
    one: async (id) => unwrap(await api.get(`/companies/${id}`)),
    create: async (data) => unwrap(await api.post('/companies', data)),
    update: async (id, data) => unwrap(await api.patch(`/companies/${id}`, data)),
    remove: async (id) => await api.delete(`/companies/${id}`),
};
