import apiClient from './api';

export const adminApi = {
  getActivity: async (limit = 20) => {
    const response = await apiClient.get('/api/admin/activity', { params: { limit } });
    return response.data;
  },
  getSystemInfo: async () => {
    const response = await apiClient.get('/api/admin/system-info');
    return response.data;
  },
  // Used by the batch manager to pick students to add to a roster
  getUsers: async (params = {}) => {
    const response = await apiClient.get('/api/users', { params });
    return response.data;
  }
};
