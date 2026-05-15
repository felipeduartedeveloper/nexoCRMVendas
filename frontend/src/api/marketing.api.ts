import { api, unwrap } from '@/lib/api';

export type CampaignStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'SENDING'
  | 'SENT'
  | 'PAUSED'
  | 'FAILED';

export type RecommendationType =
  | 'REACTIVATE_INACTIVE'
  | 'FOLLOWUP_STALE_DEAL'
  | 'UPSELL'
  | 'CROSS_SELL'
  | 'WELCOME_NEW';

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opens: number;
  uniqueOpens: number;
  clicks: number;
  uniqueClicks: number;
  bounces: number;
  unsubscribes: number;
  audienceSize: number;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: CampaignStatus;
  templateId: string | null;
  audienceId: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  fromName: string;
  fromEmail: string;
  replyToEmail: string | null;
  bodyHtml: string;
  bodyText: string | null;
  metrics: CampaignMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AudienceFilter {
  field: string;
  operator: string;
  value: unknown;
}

export interface Audience {
  id: string;
  name: string;
  description: string | null;
  filters: AudienceFilter[];
  estimatedSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  estimatedImpact: number;
  status: 'PENDING' | 'ACCEPTED' | 'DISMISSED';
  createdAt: string;
}

export interface MarketingSettings {
  id: string;
  organizationId: string;
  senderDomain: string | null;
  senderName: string | null;
  defaultReplyTo: string | null;
  signatureHtml: string | null;
  unsubscribeUrl: string | null;
  dkimVerified: boolean;
  spfVerified: boolean;
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: 'Rascunho',
  SCHEDULED: 'Agendada',
  SENDING: 'Enviando',
  SENT: 'Enviada',
  PAUSED: 'Pausada',
  FAILED: 'Falhou',
};

export const marketingApi = {
  listCampaigns: async (status?: CampaignStatus) =>
    unwrap<Campaign[]>(await api.get('/marketing/campaigns', { params: { status } })),
  getCampaign: async (id: string) =>
    unwrap<Campaign>(await api.get(`/marketing/campaigns/${id}`)),
  createCampaign: async (data: Partial<Campaign>) =>
    unwrap<Campaign>(await api.post('/marketing/campaigns', data)),
  updateCampaign: async (id: string, data: Partial<Campaign>) =>
    unwrap<Campaign>(await api.patch(`/marketing/campaigns/${id}`, data)),
  deleteCampaign: async (id: string) => await api.delete(`/marketing/campaigns/${id}`),
  scheduleCampaign: async (id: string, scheduledAt: string) =>
    unwrap<Campaign>(await api.post(`/marketing/campaigns/${id}/schedule`, { scheduledAt })),
  sendCampaignNow: async (id: string) =>
    unwrap<Campaign>(await api.post(`/marketing/campaigns/${id}/send-now`)),
  pauseCampaign: async (id: string) =>
    unwrap<Campaign>(await api.post(`/marketing/campaigns/${id}/pause`)),

  listTemplates: async () =>
    unwrap<EmailTemplate[]>(await api.get('/marketing/templates')),
  createTemplate: async (data: Partial<EmailTemplate>) =>
    unwrap<EmailTemplate>(await api.post('/marketing/templates', data)),
  updateTemplate: async (id: string, data: Partial<EmailTemplate>) =>
    unwrap<EmailTemplate>(await api.patch(`/marketing/templates/${id}`, data)),
  duplicateTemplate: async (id: string) =>
    unwrap<EmailTemplate>(await api.post(`/marketing/templates/${id}/duplicate`)),
  deleteTemplate: async (id: string) => await api.delete(`/marketing/templates/${id}`),

  listAudiences: async () => unwrap<Audience[]>(await api.get('/marketing/audiences')),
  createAudience: async (data: { name: string; description?: string; filters?: AudienceFilter[] }) =>
    unwrap<Audience>(await api.post('/marketing/audiences', data)),
  updateAudience: async (id: string, data: Partial<Audience>) =>
    unwrap<Audience>(await api.patch(`/marketing/audiences/${id}`, data)),
  deleteAudience: async (id: string) => await api.delete(`/marketing/audiences/${id}`),
  previewAudience: async (filters: AudienceFilter[]) =>
    unwrap<{ estimatedSize: number; sample: Array<{ id: string; name: string; email: string | null }> }>(
      await api.post('/marketing/audiences/preview', { filters }),
    ),

  listRecommendations: async () =>
    unwrap<MarketingRecommendation[]>(await api.get('/marketing/recommendations')),
  generateRecommendations: async () =>
    unwrap<MarketingRecommendation[]>(await api.post('/marketing/recommendations/generate')),
  acceptRecommendation: async (id: string) =>
    unwrap<MarketingRecommendation>(await api.post(`/marketing/recommendations/${id}/accept`)),
  dismissRecommendation: async (id: string) =>
    unwrap<MarketingRecommendation>(await api.post(`/marketing/recommendations/${id}/dismiss`)),

  getSettings: async () => unwrap<MarketingSettings>(await api.get('/marketing/settings')),
  updateSettings: async (data: Partial<MarketingSettings>) =>
    unwrap<MarketingSettings>(await api.patch('/marketing/settings', data)),
};
