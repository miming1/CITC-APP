export const API_BASE_URL = 'http://localhost:8000/api';

export const ENDPOINTS = {
  register:   `${API_BASE_URL}/auth/register/`,
  login:      `${API_BASE_URL}/auth/login/`,
  me:         `${API_BASE_URL}/auth/me/`,
  procedures: `${API_BASE_URL}/procedures/`,
  createProcess: `${API_BASE_URL}/process/create/`,
  faqCategories: `${API_BASE_URL}/faq-categories/`,
  faqs:       `${API_BASE_URL}/faqs/`,
  submitReq:  `${API_BASE_URL}/requests/`,
  trackReq:   `${API_BASE_URL}/requests/track/`,
  activeReq: `${API_BASE_URL}/requests/active/`,
  searchRequest: `${API_BASE_URL}/search-request/`,
  updateProfile: `${API_BASE_URL}/auth/update-profile/`,
  verifyPassword: `${API_BASE_URL}/verify-password/`,
  notifications: `${API_BASE_URL}/notifications/`,
  markNotificationsRead:`${API_BASE_URL}/notifications/read/`,
  adminTransHistory: `${API_BASE_URL}/admin/transaction-history/`,
  

  // ── OTP SECURE ENDPOINTS ───────────────────
  sendSignupOtp:   `${API_BASE_URL}/auth/send-signup-otp/`,
  verifySignupOtp: `${API_BASE_URL}/auth/verify-signup-otp/`,
  forgotPassword:  `${API_BASE_URL}/auth/forgot-password/`,
  verifyResetOtp:  `${API_BASE_URL}/auth/verify-otp/`,
  resetPassword:   `${API_BASE_URL}/auth/reset-password/`,
};