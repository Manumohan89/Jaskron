import apiClient from './api';
export const teamApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/team');
    return response.data;
  },
  getById: async id => {
    const response = await apiClient.get(`/api/team/${id}`);
    return response.data;
  },
  create: async data => {
    const response = await apiClient.post('/api/team', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/api/team/${id}`, data);
    return response.data;
  },
  delete: async id => {
    await apiClient.delete(`/api/team/${id}`);
  }
};