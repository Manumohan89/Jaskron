import apiClient from './api';

export const notificationApi = {
  getMine: async (params = {}) => {
    const response = await apiClient.get('/api/notifications', { params });
    return response.data;
  },
  markRead: async (id) => {
    const response = await apiClient.patch(`/api/notifications/${id}/read`);
    return response.data;
  },
  markAllRead: async () => {
    const response = await apiClient.patch('/api/notifications/read-all');
    return response.data;
  },
  remove: async (id) => {
    await apiClient.delete(`/api/notifications/${id}`);
  }
};
