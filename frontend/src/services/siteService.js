import apiClient from './api';

export const galleryApi = {
  getAll: async (params = {}) => (await apiClient.get('/api/gallery', { params })).data,
  adminGetAll: async () => (await apiClient.get('/api/gallery/admin/all')).data,
  create: async (data) => (await apiClient.post('/api/gallery', data)).data,
  update: async (id, data) => (await apiClient.put(`/api/gallery/${id}`, data)).data,
  remove: async (id) => { await apiClient.delete(`/api/gallery/${id}`); }
};

export const careerApi = {
  getAll: async () => (await apiClient.get('/api/careers')).data,
  getOne: async (slug) => (await apiClient.get(`/api/careers/${slug}`)).data,
  apply: async (id, payload) => (await apiClient.post(`/api/careers/${id}/apply`, payload)).data,

  adminGetAll: async () => (await apiClient.get('/api/careers/admin/all')).data,
  create: async (data) => (await apiClient.post('/api/careers', data)).data,
  update: async (id, data) => (await apiClient.put(`/api/careers/${id}`, data)).data,
  remove: async (id) => { await apiClient.delete(`/api/careers/${id}`); },
  applications: async (params = {}) =>
    (await apiClient.get('/api/careers/applications/all', { params })).data,
  updateApplication: async (id, patch) =>
    (await apiClient.patch(`/api/careers/applications/${id}`, patch)).data
};

export const bookingApi = {
  create: async (payload) => (await apiClient.post('/api/bookings', payload)).data,
  getAll: async (params = {}) => (await apiClient.get('/api/bookings', { params })).data,
  update: async (id, patch) => (await apiClient.patch(`/api/bookings/${id}`, patch)).data,
  remove: async (id) => { await apiClient.delete(`/api/bookings/${id}`); }
};
