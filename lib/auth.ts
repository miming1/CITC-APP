import { ENDPOINTS } from '../constants/api';
import { clearToken, getStoredToken, saveToken } from './tokenStore';

// =========================
// LOGIN (ID NUMBER + PASSWORD)
// =========================
export async function loginUser(
  id_number: string,
  password: string
) {
  try {

    const res = await fetch(ENDPOINTS.login, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_number,
        password,
      }),
    });

    const data = await res.json();

    if (res.ok && data.token) {

      await saveToken(data.token);

      return {
        success: true,
        token: data.token,
        role_id: data.role_id,
      };

    }

    return {
      success: false,
      error:
        data.error ?? "Login failed",
    };

  } catch (e) {

    return {
      success: false,
      error: "Cannot reach server",
    };

  }
}

// =========================
// REGISTER (ID NUMBER BASED)
// =========================
export async function registerUser(
  id_number: string,
  email: string,
  password: string
) {
  try {
    const res = await fetch(ENDPOINTS.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_number,
        email,
        password,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      return { success: true };
    }

    return {
      success: false,
      error: data.error ?? JSON.stringify(data),
    };
  } catch (e) {
    return {
      success: false,
      error: 'Cannot reach server',
    };
  }
}

// =========================
// TOKEN HELPERS
// =========================
export async function getToken() {
  return getStoredToken();
}

export async function logout() {
  clearToken();
}