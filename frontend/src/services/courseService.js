import apiClient from './api';

export const courseApi = {
  // Public catalog
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/courses', { params });
    return response.data;
  },
  getOne: async (idOrSlug) => {
    const response = await apiClient.get(`/api/courses/${idOrSlug}`);
    return response.data; // { course, enrollment, isEnrolled }
  },

  // Learner
  enroll: async (idOrSlug) => {
    const response = await apiClient.post(`/api/courses/${idOrSlug}/enroll`);
    return response.data;
  },
  myEnrollments: async () => {
    const response = await apiClient.get('/api/courses/me/enrollments');
    return response.data;
  },
  setLessonProgress: async (idOrSlug, lessonId, completed = true) => {
    const response = await apiClient.post(`/api/courses/${idOrSlug}/progress`, { lessonId, completed });
    return response.data;
  },
  review: async (idOrSlug, rating, review) => {
    const response = await apiClient.post(`/api/courses/${idOrSlug}/review`, { rating, review });
    return response.data;
  },

  // Admin
  // Uploads a video file straight to Cloudinary via the backend (multipart/form-data).
  // onProgress(percent) is called as the upload advances, for a progress bar.
  uploadVideo: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('video', file);
    const response = await apiClient.post('/api/courses/upload-video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    });
    return response.data; // { videoUrl, publicId, durationSeconds, bytes }
  },
  adminGetAll: async () => {
    const response = await apiClient.get('/api/courses/admin/all');
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post('/api/courses', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/api/courses/${id}`, data);
    return response.data;
  },
  remove: async (id) => {
    await apiClient.delete(`/api/courses/${id}`);
  },
  enrollments: async (id) => {
    const response = await apiClient.get(`/api/courses/${id}/enrollments`);
    return response.data;
  }
};
