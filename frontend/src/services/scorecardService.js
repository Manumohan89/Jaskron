import apiClient from './api';
export const scorecardApi = {
  scan: async (domain) => (await apiClient.post('/api/scorecard/scan', { domain })).data
};
