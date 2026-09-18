import apiClient from './api';
export const userApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/users');
    return response.data;
  },
  getById: async id => {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data;
  },
  create: async data => {
    const response = await apiClient.post('/api/users', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/api/users/${id}`, data);
    return response.data;
  },
  delete: async id => {
    await apiClient.delete(`/api/users/${id}`);
  }
};