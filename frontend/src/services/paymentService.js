import apiClient from './api';

export const paymentApi = {
  createOrder: async (workshopId) => {
    const response = await apiClient.post(`/api/payments/workshops/${workshopId}/order`);
    return response.data;
  },
  verify: async (workshopId, payload) => {
    const response = await apiClient.post(`/api/payments/workshops/${workshopId}/verify`, payload);
    return response.data;
  },

  createInternshipOrder: async (applicationId) => {
    const response = await apiClient.post(`/api/payments/internships/${applicationId}/order`);
    return response.data;
  },
  verifyInternshipPayment: async (applicationId, payload) => {
    const response = await apiClient.post(`/api/payments/internships/${applicationId}/verify`, payload);
    return response.data;
  },
  createServiceOrder: async (requestId) => {
    const response = await apiClient.post(`/api/payments/services/${requestId}/order`);
    return response.data;
  },
  verifyServicePayment: async (requestId, payload) => {
    const response = await apiClient.post(`/api/payments/services/${requestId}/verify`, payload);
    return response.data;
  },

  createCourseOrder: async (courseId) => {
    const response = await apiClient.post(`/api/payments/courses/${courseId}/order`);
    return response.data;
  },
  verifyCoursePayment: async (courseId, payload) => {
    const response = await apiClient.post(`/api/payments/courses/${courseId}/verify`, payload);
    return response.data;
  }
};

/** Loads the Razorpay checkout script once and caches the promise. */
let razorpayScriptPromise = null;
export function loadRazorpayScript() {
  if (razorpayScriptPromise) return razorpayScriptPromise;
  razorpayScriptPromise = new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
}
