import apiClient from './api';

export const aiApi = {
  askAdvisor: async (message) => {
    const response = await apiClient.post('/api/ai/workshop-advisor', { message });
    return response.data;
  }
};
