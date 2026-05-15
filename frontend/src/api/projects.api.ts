import { api, unwrap } from '@/lib/api';

export type ProjectStatus = 'OPEN' | 'COMPLETED' | 'CANCELED' | 'DELETED';
export type ProjectHealth = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | 'ON_HOLD';
export type ProjectVisibility = 'OWNER' | 'OWNER_GROUP' | 'ENTIRE_COMPANY';

export interface ProjectBoard {
  id: string;
  organizationId: string | null;
  name: string;
  orderIndex: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPhase {
  id: string;
  boardId: string;
  organizationId: string | null;
  name: string;
  orderIndex: number;
  color: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  organizationId: string | null;
  ownerUserId: string | null;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: ProjectStatus;
  health: ProjectHealth;
  progress: number;
  boardId: string;
  phaseId: string;
  phaseOrderIndex: number;
  contactId: string | null;
  orgCompanyId: string | null;
  labels: string[] | null;
  visibleTo: ProjectVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  organizationId: string | null;
  title: string;
  dueDate: string | null;
  done: boolean;
  ownerUserId: string | null;
  createdAt: string;
}

export interface PhaseSummary {
  phaseId: string;
  name: string;
  color: string;
  count: number;
  avgProgress: number;
}

export const HEALTH_LABELS: Record<ProjectHealth, string> = {
  ON_TRACK: 'No prazo',
  AT_RISK: 'Em risco',
  OFF_TRACK: 'Atrasado',
  ON_HOLD: 'Em pausa',
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  OPEN: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
  DELETED: 'Excluído',
};

export const projectsApi = {
  listBoards: async () =>
    unwrap<ProjectBoard[]>(await api.get('/project-boards')),
  listPhases: async (boardId: string) =>
    unwrap<ProjectPhase[]>(await api.get(`/project-boards/${boardId}/phases`)),
  list: async (params: { boardId?: string; status?: ProjectStatus; search?: string } = {}) =>
    unwrap<Project[]>(await api.get('/projects', { params })),
  one: async (id: string) => unwrap<Project>(await api.get(`/projects/${id}`)),
  create: async (data: {
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    health?: ProjectHealth;
    boardId?: string;
    phaseId?: string;
    contactId?: string;
    orgCompanyId?: string;
    labels?: string[];
    visibleTo?: ProjectVisibility;
  }) => unwrap<Project>(await api.post('/projects', data)),
  update: async (id: string, data: Partial<Project>) =>
    unwrap<Project>(await api.patch(`/projects/${id}`, data)),
  move: async (id: string, phaseId: string, order: number) =>
    unwrap<Project>(await api.patch(`/projects/${id}/move`, { phaseId, order })),
  complete: async (id: string) =>
    unwrap<Project>(await api.post(`/projects/${id}/complete`)),
  archive: async (id: string) =>
    unwrap<Project>(await api.post(`/projects/${id}/archive`)),
  remove: async (id: string) => await api.delete(`/projects/${id}`),
  summary: async (boardId: string) =>
    unwrap<PhaseSummary[]>(await api.get('/projects/summary', { params: { boardId } })),

  listTasks: async (projectId: string) =>
    unwrap<ProjectTask[]>(await api.get(`/projects/${projectId}/tasks`)),
  createTask: async (projectId: string, data: { title: string; dueDate?: string }) =>
    unwrap<ProjectTask>(await api.post(`/projects/${projectId}/tasks`, data)),
  toggleTaskDone: async (id: string) =>
    unwrap<ProjectTask>(await api.patch(`/project-tasks/${id}/done`)),
  deleteTask: async (id: string) =>
    await api.delete(`/project-tasks/${id}`),
};
