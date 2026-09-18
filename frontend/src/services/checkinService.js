import apiClient from './api';

export const checkinApi = {
  getQr: async (workshopId) => {
    const response = await apiClient.get(`/api/checkin/workshops/${workshopId}/qr`);
    return response.data;
  },
  checkIn: async (workshopId, payload) => {
    const response = await apiClient.post(`/api/checkin/workshops/${workshopId}/check-in`, payload);
    return response.data;
  }
};
