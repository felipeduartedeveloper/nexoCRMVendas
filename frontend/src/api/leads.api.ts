import { api, unwrap } from '@/lib/api';

export type LeadStatus = 'INBOX' | 'WORKING' | 'ARCHIVED' | 'CONVERTED';

export interface Lead {
  id: string;
  organizationId: string | null;
  title: string;
  value: number | string;
  currency: string;
  status: LeadStatus;
  contactId: string | null;
  orgCompanyId: string | null;
  ownerUserId: string | null;
  labels: string[] | null;
  source: string | null;
  notes: string | null;
  convertedDealId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadsList {
  items: Lead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface LeadCounters {
  inbox: number;
  working: number;
  archived: number;
  converted: number;
}

export const leadsApi = {
  list: async (params: { page?: number; limit?: number; status?: LeadStatus } = {}) =>
    unwrap<LeadsList>(await api.get('/leads', { params })),
  counters: async () => unwrap<LeadCounters>(await api.get('/leads/counters')),
  one: async (id: string) => unwrap<Lead>(await api.get(`/leads/${id}`)),
  create: async (data: {
    title: string;
    value?: number;
    currency?: string;
    source?: string;
    contactId?: string;
    orgCompanyId?: string;
  }) => unwrap<Lead>(await api.post('/leads', data)),
  update: async (id: string, data: Partial<Lead>) =>
    unwrap<Lead>(await api.patch(`/leads/${id}`, data)),
  archive: async (id: string) => unwrap<Lead>(await api.patch(`/leads/${id}/archive`)),
  convert: async (id: string, data: { pipelineId?: string; stageId?: string } = {}) =>
    unwrap<{ id: string }>(await api.post(`/leads/${id}/convert`, data)),
  remove: async (id: string) => await api.delete(`/leads/${id}`),
};
