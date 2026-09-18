import apiClient from './api';
export const workshopApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/workshops');
    return response.data;
  },
  getById: async id => {
    const response = await apiClient.get(`/api/workshops/${id}`);
    return response.data;
  },
  create: async data => {
    const response = await apiClient.post('/api/workshops', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/api/workshops/${id}`, data);
    return response.data;
  },
  delete: async id => {
    await apiClient.delete(`/api/workshops/${id}`);
  },
  enroll: async id => {
    const response = await apiClient.post(`/api/workshops/${id}/enroll`);
    return response.data;
  }
};