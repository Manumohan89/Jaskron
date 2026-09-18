import apiClient from './api';

export const resourceApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/resources', { params });
    return response.data;
  },
  upload: async (formData) => {
    const response = await apiClient.post('/api/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  delete: async (id) => {
    await apiClient.delete(`/api/resources/${id}`);
  },
  downloadUrl: (id) => {
    const base = apiClient.defaults.baseURL;
    return `${base}/api/resources/${id}/download`;
  }
};
