export const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const ENDPOINTS = {
  register:   `${API_BASE_URL}/auth/register/`,
  login:      `${API_BASE_URL}/auth/login/`,
  procedures: `${API_BASE_URL}/procedures/`,
  faqs:       `${API_BASE_URL}/faqs/`,
  submitReq:  `${API_BASE_URL}/requests/`,
  trackReq:   `${API_BASE_URL}/requests/track/`,
};