import { api, unwrap } from '@/lib/api';
export const HEALTH_LABELS = {
    ON_TRACK: 'No prazo',
    AT_RISK: 'Em risco',
    OFF_TRACK: 'Atrasado',
    ON_HOLD: 'Em pausa',
};
export const STATUS_LABELS = {
    OPEN: 'Em andamento',
    COMPLETED: 'Concluído',
    CANCELED: 'Cancelado',
    DELETED: 'Excluído',
};
export const projectsApi = {
    listBoards: async () => unwrap(await api.get('/project-boards')),
    listPhases: async (boardId) => unwrap(await api.get(`/project-boards/${boardId}/phases`)),
    list: async (params = {}) => unwrap(await api.get('/projects', { params })),
    one: async (id) => unwrap(await api.get(`/projects/${id}`)),
    create: async (data) => unwrap(await api.post('/projects', data)),
    update: async (id, data) => unwrap(await api.patch(`/projects/${id}`, data)),
    move: async (id, phaseId, order) => unwrap(await api.patch(`/projects/${id}/move`, { phaseId, order })),
    complete: async (id) => unwrap(await api.post(`/projects/${id}/complete`)),
    archive: async (id) => unwrap(await api.post(`/projects/${id}/archive`)),
    remove: async (id) => await api.delete(`/projects/${id}`),
    summary: async (boardId) => unwrap(await api.get('/projects/summary', { params: { boardId } })),
    listTasks: async (projectId) => unwrap(await api.get(`/projects/${projectId}/tasks`)),
    createTask: async (projectId, data) => unwrap(await api.post(`/projects/${projectId}/tasks`, data)),
    toggleTaskDone: async (id) => unwrap(await api.patch(`/project-tasks/${id}/done`)),
    deleteTask: async (id) => await api.delete(`/project-tasks/${id}`),
};
