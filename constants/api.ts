export const API_BASE_URL = 'http://localhost:8000/api';

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

  // ── OTP SECURE ENDPOINTS ───────────────────
  sendSignupOtp:   `${API_BASE_URL}/auth/send-signup-otp/`,
  verifySignupOtp: `${API_BASE_URL}/auth/verify-signup-otp/`,
  forgotPassword:  `${API_BASE_URL}/auth/forgot-password/`,
  verifyResetOtp:  `${API_BASE_URL}/auth/verify-otp/`,
  resetPassword:   `${API_BASE_URL}/auth/reset-password/`,
};
