import apiClient from './api';
export const sessionApi = {
  getAll: async () => (await apiClient.get('/api/auth/sessions')).data,
  revoke: async (id) => { await apiClient.delete(`/api/auth/sessions/${id}`); },
  logoutAll: async () => (await apiClient.post('/api/auth/logout-all')).data
};
