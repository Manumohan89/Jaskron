import apiClient from './api';
export const caseStudyApi = {
  getAll: async (params = {}) => (await apiClient.get('/api/case-studies', { params })).data,
  getBySlug: async (slug) => (await apiClient.get(`/api/case-studies/${slug}`)).data,
  getAllAdmin: async () => (await apiClient.get('/api/case-studies/admin/all')).data,
  create: async (data) => (await apiClient.post('/api/case-studies', data)).data,
  update: async (id, data) => (await apiClient.put(`/api/case-studies/${id}`, data)).data,
  delete: async (id) => { await apiClient.delete(`/api/case-studies/${id}`); }
};
