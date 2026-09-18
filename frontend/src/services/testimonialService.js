import apiClient from './api';

export const testimonialApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/testimonials');
    return response.data;
  },
  getAllAdmin: async () => {
    const response = await apiClient.get('/api/testimonials/admin/all');
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post('/api/testimonials', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/api/testimonials/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await apiClient.delete(`/api/testimonials/${id}`);
  }
};
