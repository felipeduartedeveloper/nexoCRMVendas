import { api, unwrap } from '@/lib/api';

export interface CurrentOrganization {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'INACTIVE';
  plan: 'TRIAL' | 'ESSENTIAL' | 'ADVANCED' | 'PROFESSIONAL' | 'POWER' | 'ENTERPRISE';
  maxUsers: number;
  industry: string | null;
  employeesRange: string | null;
  website: string | null;
  phone: string | null;
  country: string | null;
  currency: string | null;
  domain: string | null;
  maintenanceWindowUtc: string | null;
  locale: string;
  timezone: string;
  notes: string | null;
}

export interface UsageSnapshot {
  plan: string;
  limits: { users: { used: number; max: number } };
  counts: {
    users: number;
    contacts: number;
    companies: number;
    deals: { open: number; won: number; lost: number };
    activities: number;
    leads: number;
  };
}

export interface Label {
  id: string;
  name: string;
  color: string;
  entityType: 'CONTACT' | 'COMPANY' | 'DEAL' | 'LEAD' | 'ACTIVITY';
  archived: boolean;
}

export interface LostReason {
  id: string;
  name: string;
  archived: boolean;
}

export interface CustomField {
  id: string;
  entity: 'CONTACT' | 'COMPANY' | 'DEAL' | 'LEAD' | 'ACTIVITY';
  label: string;
  key: string;
  dataType: string;
  options: string[] | null;
  required: boolean;
  orderIndex: number;
}

export const settingsApi = {
  currentOrg: async () =>
    unwrap<CurrentOrganization>(await api.get('/organizations/current')),
  updateCurrentOrg: async (data: Partial<CurrentOrganization>) =>
    unwrap<CurrentOrganization>(await api.patch('/organizations/current', data)),
  usage: async () => unwrap<UsageSnapshot>(await api.get('/usage/current')),
};

export const labelsApi = {
  list: async (entityType?: string) =>
    unwrap<Label[]>(await api.get('/labels', { params: { entityType } })),
  create: async (data: { name: string; color?: string; entityType?: string }) =>
    unwrap<Label>(await api.post('/labels', data)),
  update: async (id: string, data: Partial<Label>) =>
    unwrap<Label>(await api.patch(`/labels/${id}`, data)),
  remove: async (id: string) => await api.delete(`/labels/${id}`),
};

export const lostReasonsApi = {
  list: async () => unwrap<LostReason[]>(await api.get('/lost-reasons')),
  create: async (data: { name: string }) =>
    unwrap<LostReason>(await api.post('/lost-reasons', data)),
  update: async (id: string, data: Partial<LostReason>) =>
    unwrap<LostReason>(await api.patch(`/lost-reasons/${id}`, data)),
  remove: async (id: string) => await api.delete(`/lost-reasons/${id}`),
};

export const customFieldsApi = {
  list: async (entity?: string) =>
    unwrap<CustomField[]>(await api.get('/custom-fields', { params: { entity } })),
  create: async (data: any) =>
    unwrap<CustomField>(await api.post('/custom-fields', data)),
  update: async (id: string, data: Partial<CustomField>) =>
    unwrap<CustomField>(await api.patch(`/custom-fields/${id}`, data)),
  remove: async (id: string) => await api.delete(`/custom-fields/${id}`),
};

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'SALES' | 'VIEWER';
  organizationId: string | null;
  isActive: boolean;
  emailVerified: boolean;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export const usersApi = {
  list: async (params: { page?: number; limit?: number; search?: string } = {}) =>
    unwrap<{ items: AppUser[]; total: number; page: number; pages: number }>(
      await api.get('/users', { params }),
    ),
  invite: async (data: { email: string; name: string; role?: string }) =>
    unwrap<{ user: AppUser; tempPassword: string }>(await api.post('/users/invite', data)),
  update: async (id: string, data: Partial<AppUser>) =>
    unwrap<AppUser>(await api.patch(`/users/${id}`, data)),
  activate: async (id: string) =>
    unwrap<AppUser>(await api.patch(`/users/${id}/activate`)),
  deactivate: async (id: string) =>
    unwrap<AppUser>(await api.patch(`/users/${id}/deactivate`)),
  remove: async (id: string) => await api.delete(`/users/${id}`),
};
