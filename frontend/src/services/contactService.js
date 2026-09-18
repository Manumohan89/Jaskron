import apiClient from './api';
export const contactApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/contacts');
    return response.data;
  },
  getById: async id => {
    const response = await apiClient.get(`/api/contacts/${id}`);
    return response.data;
  },
  submit: async data => {
    const response = await apiClient.post('/api/contacts', data);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/api/contacts/${id}/status`, {
      status
    });
    return response.data;
  },
  delete: async id => {
    await apiClient.delete(`/api/contacts/${id}`);
  }
};