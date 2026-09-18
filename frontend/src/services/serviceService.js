import apiClient from './api';
export const serviceApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/services');
    return response.data;
  },
  getById: async id => {
    const response = await apiClient.get(`/api/services/${id}`);
    return response.data;
  },
  create: async data => {
    const response = await apiClient.post('/api/services', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/api/services/${id}`, data);
    return response.data;
  },
  delete: async id => {
    await apiClient.delete(`/api/services/${id}`);
  }
};