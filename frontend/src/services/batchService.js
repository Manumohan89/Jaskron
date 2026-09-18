import apiClient from './api';

export const batchApi = {
  // Student
  mine: async () => (await apiClient.get('/api/batches/me')).data,

  // Admin
  getAll: async (params = {}) => (await apiClient.get('/api/batches', { params })).data,
  getOne: async (id) => (await apiClient.get(`/api/batches/${id}`)).data,
  create: async (data) => (await apiClient.post('/api/batches', data)).data,
  update: async (id, data) => (await apiClient.put(`/api/batches/${id}`, data)).data,
  remove: async (id) => { await apiClient.delete(`/api/batches/${id}`); },

  addMember: async (id, payload) => (await apiClient.post(`/api/batches/${id}/members`, payload)).data,
  updateMember: async (id, memberId, patch) =>
    (await apiClient.patch(`/api/batches/${id}/members/${memberId}`, patch)).data,
  removeMember: async (id, memberId) => {
    await apiClient.delete(`/api/batches/${id}/members/${memberId}`);
  },
  approveAll: async (id) => (await apiClient.post(`/api/batches/${id}/approve-all`)).data,

  issueCertificate: async (id, memberId, payload) =>
    (await apiClient.post(`/api/batches/${id}/members/${memberId}/certificate`, payload)).data,
  issueAllCertificates: async (id) => (await apiClient.post(`/api/batches/${id}/certificates`)).data,

  addSession: async (id, payload) => (await apiClient.post(`/api/batches/${id}/sessions`, payload)).data,
  updateSession: async (id, sessionId, patch) =>
    (await apiClient.patch(`/api/batches/${id}/sessions/${sessionId}`, patch)).data,
  removeSession: async (id, sessionId) => {
    await apiClient.delete(`/api/batches/${id}/sessions/${sessionId}`);
  }
};
