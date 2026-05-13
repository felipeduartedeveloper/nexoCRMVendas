import { api, unwrap } from '@/lib/api';

export type DealStatus = 'OPEN' | 'WON' | 'LOST' | 'DELETED';

export interface Deal {
  id: string;
  organizationId: string | null;
  title: string;
  value: number | string;
  currency: string;
  pipelineId: string;
  stageId: string;
  stageOrderIndex: number;
  contactId: string | null;
  orgCompanyId: string | null;
  ownerUserId: string | null;
  status: DealStatus;
  expectedCloseDate: string | null;
  wonAt: string | null;
  lostAt: string | null;
  labels: string[] | null;
  notes: string | null;
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StageSummaryRow {
  stageId: string;
  count: number;
  total: number;
}

export interface DealsList {
  items: Deal[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const dealsApi = {
  list: async (params: { page?: number; limit?: number; pipelineId?: string; status?: DealStatus } = {}) =>
    unwrap<DealsList>(await api.get('/deals', { params })),
  kanban: async (pipelineId: string) =>
    unwrap<Deal[]>(await api.get(`/deals/kanban/${pipelineId}`)),
  summary: async (pipelineId: string) =>
    unwrap<StageSummaryRow[]>(await api.get(`/deals/summary/${pipelineId}`)),
  one: async (id: string) => unwrap<Deal>(await api.get(`/deals/${id}`)),
  create: async (data: {
    title: string;
    pipelineId: string;
    stageId: string;
    value?: number;
    currency?: string;
    contactId?: string;
    orgCompanyId?: string;
    expectedCloseDate?: string;
    notes?: string;
  }) => unwrap<Deal>(await api.post('/deals', data)),
  update: async (id: string, data: Partial<Deal>) =>
    unwrap<Deal>(await api.patch(`/deals/${id}`, data)),
  move: async (id: string, data: { stageId: string; stageOrderIndex?: number }) =>
    unwrap<Deal>(await api.patch(`/deals/${id}/move`, data)),
  win: async (id: string) => unwrap<Deal>(await api.patch(`/deals/${id}/win`)),
  lose: async (id: string, reason?: string) =>
    unwrap<Deal>(await api.patch(`/deals/${id}/lose`, { reason })),
  reopen: async (id: string) => unwrap<Deal>(await api.patch(`/deals/${id}/reopen`)),
  remove: async (id: string) => await api.delete(`/deals/${id}`),
};
