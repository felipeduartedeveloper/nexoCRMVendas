import { api, unwrap } from '@/lib/api';
export const settingsApi = {
    currentOrg: async () => unwrap(await api.get('/organizations/current')),
    updateCurrentOrg: async (data) => unwrap(await api.patch('/organizations/current', data)),
    usage: async () => unwrap(await api.get('/usage/current')),
};
export const billingApi = {
    checkout: async (data) => unwrap(await api.post('/billing/checkout', data)),
    portal: async (returnUrl) => unwrap(await api.post('/billing/portal', { returnUrl })),
};
export const labelsApi = {
    list: async (entityType) => unwrap(await api.get('/labels', { params: { entityType } })),
    create: async (data) => unwrap(await api.post('/labels', data)),
    update: async (id, data) => unwrap(await api.patch(`/labels/${id}`, data)),
    remove: async (id) => await api.delete(`/labels/${id}`),
};
export const lostReasonsApi = {
    list: async () => unwrap(await api.get('/lost-reasons')),
    create: async (data) => unwrap(await api.post('/lost-reasons', data)),
    update: async (id, data) => unwrap(await api.patch(`/lost-reasons/${id}`, data)),
    remove: async (id) => await api.delete(`/lost-reasons/${id}`),
};
export const customFieldsApi = {
    list: async (entity) => unwrap(await api.get('/custom-fields', { params: { entity } })),
    create: async (data) => unwrap(await api.post('/custom-fields', data)),
    update: async (id, data) => unwrap(await api.patch(`/custom-fields/${id}`, data)),
    remove: async (id) => await api.delete(`/custom-fields/${id}`),
};
export const usersApi = {
    list: async (params = {}) => unwrap(await api.get('/users', { params })),
    invite: async (data) => unwrap(await api.post('/users/invite', data)),
    update: async (id, data) => unwrap(await api.patch(`/users/${id}`, data)),
    activate: async (id) => unwrap(await api.patch(`/users/${id}/activate`)),
    deactivate: async (id) => unwrap(await api.patch(`/users/${id}/deactivate`)),
    remove: async (id) => await api.delete(`/users/${id}`),
};
