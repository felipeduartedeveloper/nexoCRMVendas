import { api, unwrap } from '@/lib/api';

export type ActivityType = 'CALL' | 'MEETING' | 'TASK' | 'DEADLINE' | 'EMAIL' | 'LUNCH';
export type ActivityPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Activity {
  id: string;
  organizationId: string | null;
  subject: string;
  type: ActivityType;
  priority: ActivityPriority;
  done: boolean;
  dueAt: string | null;
  durationMin: number;
  dealId: string | null;
  contactId: string | null;
  orgCompanyId: string | null;
  ownerUserId: string | null;
  notes: string | null;
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivitiesList {
  items: Activity[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ActivityCounters {
  overdue: number;
  today: number;
  upcoming: number;
  done: number;
}

export const activitiesApi = {
  list: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    done?: boolean;
    type?: ActivityType;
    dealId?: string;
    contactId?: string;
    ownerUserId?: string;
    scope?: 'overdue' | 'today' | 'upcoming' | 'all';
  } = {}) =>
    unwrap<ActivitiesList>(
      await api.get('/activities', {
        params: {
          ...params,
          done: params.done === undefined ? undefined : String(params.done),
        },
      }),
    ),
  counters: async () => unwrap<ActivityCounters>(await api.get('/activities/counters')),
  one: async (id: string) => unwrap<Activity>(await api.get(`/activities/${id}`)),
  create: async (data: {
    subject: string;
    type?: ActivityType;
    priority?: ActivityPriority;
    dueAt?: string;
    durationMin?: number;
    dealId?: string;
    contactId?: string;
    orgCompanyId?: string;
    ownerUserId?: string;
    notes?: string;
  }) => unwrap<Activity>(await api.post('/activities', data)),
  update: async (id: string, data: Partial<Activity>) =>
    unwrap<Activity>(await api.patch(`/activities/${id}`, data)),
  markDone: async (id: string, done: boolean) =>
    unwrap<Activity>(await api.patch(`/activities/${id}/done`, { done })),
  remove: async (id: string) => await api.delete(`/activities/${id}`),
};
