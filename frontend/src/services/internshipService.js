import apiClient from './api';

export const internshipApi = {
  getAll: async (params = {}) => (await apiClient.get('/api/internships', { params })).data,
  getOne: async (idOrSlug) => (await apiClient.get(`/api/internships/${idOrSlug}`)).data,
  apply: async (idOrSlug, payload) =>
    (await apiClient.post(`/api/internships/${idOrSlug}/apply`, payload)).data,
  myApplications: async () => (await apiClient.get('/api/internships/me/applications')).data,

  // Admin
  adminGetAll: async () => (await apiClient.get('/api/internships/admin/all')).data,
  create: async (data) => (await apiClient.post('/api/internships', data)).data,
  update: async (id, data) => (await apiClient.put(`/api/internships/${id}`, data)).data,
  remove: async (id) => { await apiClient.delete(`/api/internships/${id}`); },
  adminApplications: async (params = {}) =>
    (await apiClient.get('/api/internships/applications/all', { params })).data,
  updateApplication: async (id, patch) =>
    (await apiClient.patch(`/api/internships/applications/${id}`, patch)).data
};
