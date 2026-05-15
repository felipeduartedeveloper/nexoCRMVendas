import { api, unwrap } from '@/lib/api';

export type WebhookStatus = 'ACTIVE' | 'PAUSED' | 'FAILING';

export interface Webhook {
  id: string;
  organizationId: string | null;
  ownerUserId: string | null;
  name: string | null;
  targetUrl: string;
  events: string[];
  secret: string;
  status: WebhookStatus;
  lastDeliveryAt: string | null;
  lastStatusCode: number | null;
  consecutiveFailures: number;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, unknown>;
  attempt: number;
  statusCode: number | null;
  responseBody: string | null;
  latencyMs: number | null;
  success: boolean;
  nextRetryAt: string | null;
  createdAt: string;
}

export const webhooksApi = {
  list: async () => unwrap<Webhook[]>(await api.get('/webhooks')),
  one: async (id: string) => unwrap<Webhook>(await api.get(`/webhooks/${id}`)),
  events: async () => unwrap<string[]>(await api.get('/webhooks/events')),
  create: async (data: { targetUrl: string; events: string[]; name?: string }) =>
    unwrap<Webhook>(await api.post('/webhooks', data)),
  update: async (id: string, data: Partial<Webhook>) =>
    unwrap<Webhook>(await api.patch(`/webhooks/${id}`, data)),
  setStatus: async (id: string, status: 'ACTIVE' | 'PAUSED') =>
    unwrap<Webhook>(await api.patch(`/webhooks/${id}/status`, { status })),
  regenerateSecret: async (id: string) =>
    unwrap<Webhook>(await api.post(`/webhooks/${id}/regenerate-secret`)),
  remove: async (id: string) => await api.delete(`/webhooks/${id}`),
  test: async (id: string, event?: string) =>
    unwrap<WebhookDelivery>(await api.post(`/webhooks/${id}/test`, { event })),
  deliveries: async (id: string, page = 1, limit = 50) =>
    unwrap<{
      items: WebhookDelivery[];
      total: number;
      page: number;
      limit: number;
      pages: number;
    }>(await api.get(`/webhooks/${id}/deliveries`, { params: { page, limit } })),
};

export function groupEvents(events: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const e of events) {
    const [entity] = e.split('.');
    if (!groups[entity]) groups[entity] = [];
    groups[entity].push(e);
  }
  return groups;
}

export const ENTITY_LABELS: Record<string, string> = {
  deal: 'Negócios',
  person: 'Pessoas',
  organization: 'Empresas',
  activity: 'Atividades',
  lead: 'Leads',
};
