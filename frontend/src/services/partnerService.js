import apiClient from './api';
export const partnerApi = {
  getAll: async () => (await apiClient.get('/api/partners')).data,
  getAllAdmin: async () => (await apiClient.get('/api/partners/admin/all')).data,
  create: async (data) => (await apiClient.post('/api/partners', data)).data,
  update: async (id, data) => (await apiClient.put(`/api/partners/${id}`, data)).data,
  delete: async (id) => { await apiClient.delete(`/api/partners/${id}`); }
};
