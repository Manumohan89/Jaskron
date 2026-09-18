import apiClient from './api';

export const blogApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/blog', { params });
    return response.data;
  },
  getBySlug: async (slug) => {
    const response = await apiClient.get(`/api/blog/${slug}`);
    return response.data;
  },
  getAllAdmin: async () => {
    const response = await apiClient.get('/api/blog/admin/all');
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post('/api/blog', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/api/blog/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await apiClient.delete(`/api/blog/${id}`);
  }
};
