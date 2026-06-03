import { api, unwrap } from '@/lib/api';
export const productsApi = {
    list: async (params = {}) => unwrap(await api.get('/products', { params })),
    one: async (id) => unwrap(await api.get(`/products/${id}`)),
    create: async (data) => unwrap(await api.post('/products', data)),
    update: async (id, data) => unwrap(await api.patch(`/products/${id}`, data)),
    setActive: async (id, active) => unwrap(await api.patch(`/products/${id}/active`, { active })),
    remove: async (id) => await api.delete(`/products/${id}`),
    addToDeal: async (data) => unwrap(await api.post('/products/deal-products', data)),
    removeFromDeal: async (id) => await api.delete(`/products/deal-products/${id}`),
    listOfDeal: async (dealId) => unwrap(await api.get(`/deals/${dealId}/products`)),
};
export const BILLING_FREQUENCY_LABELS = {
    ONE_TIME: 'Único',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensal',
    QUARTERLY: 'Trimestral',
    SEMI_ANNUAL: 'Semestral',
    ANNUAL: 'Anual',
};
export const VISIBILITY_LABELS = {
    OWNER: 'Apenas o responsável',
    OWNER_GROUP: 'Grupo do responsável',
    ENTIRE_COMPANY: 'Toda a empresa',
};
export function formatCurrency(amount, currency = 'BRL') {
    const num = typeof amount === 'string' ? Number(amount) : amount;
    try {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(num);
    }
    catch {
        return `${currency} ${num.toFixed(2)}`;
    }
}
