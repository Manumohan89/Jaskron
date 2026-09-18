import apiClient from './api';
export const newsletterApi = {
  subscribe: async (email, source) => (await apiClient.post('/api/newsletter/subscribe', { email, source })).data,
  unsubscribe: async (email) => (await apiClient.post('/api/newsletter/unsubscribe', { email })).data,
  getAllAdmin: async (params = {}) => (await apiClient.get('/api/newsletter/admin/subscribers', { params })).data,
  exportCsvUrl: () => `${apiClient.defaults.baseURL}/api/newsletter/admin/subscribers/export.csv`
};
