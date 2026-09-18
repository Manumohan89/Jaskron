import apiClient from './api';

export const authApi = {
  forgotPassword: async (email) => {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token, password) => {
    const response = await apiClient.post('/api/auth/reset-password', { token, password });
    return response.data;
  },
  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.post('/api/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
  updatePreferences: async (prefs) => {
    const response = await apiClient.put('/api/users/me/preferences', prefs);
    return response.data;
  }
};
