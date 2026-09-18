import apiClient from './api';

export const examApi = {
  // Student — exam code flow
  lookup: async (examCode) => {
    const response = await apiClient.post('/api/exams/lookup', { examCode });
    return response.data;
  },
  start: async (examCode) => {
    const response = await apiClient.post('/api/exams/start', { examCode });
    return response.data; // { attemptId, expiresAt, exam }
  },
  submit: async (attemptId, answers, focusLostCount = 0) => {
    const response = await apiClient.post(`/api/exams/attempt/${attemptId}/submit`, {
      answers,
      focusLostCount
    });
    return response.data;
  },
  getAttempt: async (attemptId) => {
    const response = await apiClient.get(`/api/exams/attempt/${attemptId}`);
    return response.data;
  },
  myAttempts: async () => {
    const response = await apiClient.get('/api/exams/me/attempts');
    return response.data;
  },

  // Admin
  adminGetAll: async () => {
    const response = await apiClient.get('/api/exams/admin/all');
    return response.data;
  },
  adminGetOne: async (id) => {
    const response = await apiClient.get(`/api/exams/admin/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post('/api/exams', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/api/exams/${id}`, data);
    return response.data;
  },
  regenerateCode: async (id) => {
    const response = await apiClient.post(`/api/exams/${id}/regenerate-code`);
    return response.data;
  },
  remove: async (id) => {
    await apiClient.delete(`/api/exams/${id}`);
  },
  results: async (id) => {
    const response = await apiClient.get(`/api/exams/${id}/results`);
    return response.data;
  }
};
