import { ENDPOINTS } from '../constants/api';
import { clearToken, getStoredToken, saveRememberedId, saveToken } from './tokenStore';

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
      saveRememberedId(id_number); 

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
      saveRememberedId(id_number); 
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
// UPDATE PROFILE
// =========================
export async function updateUserProfile(
  id_number?: string,
  email?: string,
  password?: string,
  student_name?: string,
  program?: string,
  year_level?: number
) {
  try {
    const token = await getStoredToken();

    const res = await fetch(ENDPOINTS.updateProfile, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        id_number,
        email,
        password,
        student_name,
        program,
        year_level,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      if (id_number) {
        saveRememberedId(id_number);
      }
      return { success: true, data };
    }

    return {
      success: false,
      error: data.error ?? "Update failed",
    };

  } catch {
    return {
      success: false,
      error: "Cannot reach server",
    };
  }
}

export async function verifyCurrentPassword(
  password: string
) {
  try {

    const token = await getStoredToken();

    const res = await fetch(
      ENDPOINTS.verifyPassword,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          password,
        }),
      }
    );

    const data = await res.json();

    return data.valid === true;

  } catch (e) {

    return false;

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