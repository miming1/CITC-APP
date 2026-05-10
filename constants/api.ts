export const API_BASE_URL = 'https://citc-app.onrender.com/api';

export const ENDPOINTS = {
  register:   `${API_BASE_URL}/auth/register/`,
  login:      `${API_BASE_URL}/auth/login/`,
  me:         `${API_BASE_URL}/auth/me/`,
  procedures: `${API_BASE_URL}/procedures/`,
  faqs:       `${API_BASE_URL}/faqs/`,
  submitReq:  `${API_BASE_URL}/requests/`,
  trackReq:   `${API_BASE_URL}/requests/track/`,
  updateProfile: `${API_BASE_URL}/auth/update-profile/`,
  verifyPassword: `${API_BASE_URL}/verify-password/`,
};