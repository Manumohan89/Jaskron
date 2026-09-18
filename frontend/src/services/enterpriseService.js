import apiClient from './api';
export const enterpriseApi = {
  submitInquiry: async (data) => (await apiClient.post('/api/enterprise/inquiries', data)).data,
  getAllAdmin: async (params = {}) => (await apiClient.get('/api/enterprise/inquiries', { params })).data,
  updateStatus: async (id, status) => (await apiClient.patch(`/api/enterprise/inquiries/${id}`, { status })).data
};
