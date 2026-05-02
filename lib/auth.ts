import { ENDPOINTS } from '../constants/api';
import { clearToken, getStoredToken, saveToken } from './tokenStore';

export async function loginUser(username: string, password: string) {
  try {
    const res = await fetch(ENDPOINTS.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      saveToken(data.token);
      return { success: true, token: data.token };
    }
    return { success: false, error: data.error ?? 'Login failed' };
  } catch (e) {
    return { success: false, error: 'Cannot reach server' };
  }
}

export async function registerUser(username: string, email: string, password: string) {
  try {
    const res = await fetch(ENDPOINTS.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    return res.ok
      ? { success: true }
      : { success: false, error: JSON.stringify(data) };
  } catch (e) {
    return { success: false, error: 'Cannot reach server' };
  }
}

export async function getToken() {
  return getStoredToken();
}

export async function logout() {
  clearToken();
}