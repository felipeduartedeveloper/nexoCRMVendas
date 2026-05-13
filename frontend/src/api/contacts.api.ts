import { api, unwrap } from '@/lib/api';

export interface Contact {
  id: string;
  organizationId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  orgCompanyId: string | null;
  labels: string[] | null;
  ownerUserId: string | null;
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  organizationId: string | null;
  name: string;
  website: string | null;
  industry: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  labels: string[] | null;
  ownerUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DuplicateGroup {
  email: string;
  count: number;
  contactIds: string[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const contactsApi = {
  list: async (params: { page?: number; limit?: number; search?: string } = {}) =>
    unwrap<Paginated<Contact>>(await api.get('/contacts', { params })),
  timeline: async () => unwrap<Contact[]>(await api.get('/contacts/timeline')),
  duplicates: async () => unwrap<DuplicateGroup[]>(await api.get('/contacts/duplicates')),
  one: async (id: string) => unwrap<Contact>(await api.get(`/contacts/${id}`)),
  create: async (data: {
    name: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    orgCompanyId?: string;
    labels?: string[];
  }) => unwrap<Contact>(await api.post('/contacts', data)),
  update: async (id: string, data: Partial<Contact>) =>
    unwrap<Contact>(await api.patch(`/contacts/${id}`, data)),
  remove: async (id: string) => await api.delete(`/contacts/${id}`),
  merge: async (targetId: string, sourceIds: string[]) =>
    unwrap<Contact>(await api.post('/contacts/merge', { targetId, sourceIds })),
  bulkDelete: async (ids: string[]) =>
    unwrap<{ removed: number }>(await api.post('/contacts/bulk-delete', { ids })),
};

export const companiesApi = {
  list: async (params: { page?: number; limit?: number; search?: string } = {}) =>
    unwrap<Paginated<Company>>(await api.get('/companies', { params })),
  one: async (id: string) => unwrap<Company>(await api.get(`/companies/${id}`)),
  create: async (data: {
    name: string;
    website?: string;
    industry?: string;
    country?: string;
    phone?: string;
    email?: string;
  }) => unwrap<Company>(await api.post('/companies', data)),
  update: async (id: string, data: Partial<Company>) =>
    unwrap<Company>(await api.patch(`/companies/${id}`, data)),
  remove: async (id: string) => await api.delete(`/companies/${id}`),
};
