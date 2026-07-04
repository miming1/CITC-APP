import { API_BASE_URL, ENDPOINTS } from '../constants/api';
import { getToken } from './auth';

// ── Procedures ────────────────────────────────────────────────
export async function fetchProcedures() {
   const res = await fetch(ENDPOINTS.procedures, { cache: "no-store" });
  if (!res.ok) throw new Error('Failed to fetch procedures');
  return res.json();
  // returns: [{ id, procedure_name, description, created_at, updated_at }]
}

// ── FAQs ──────────────────────────────────────────────────────
export const fetchFAQs = async (categoryId?: string) => {
  const url = categoryId
    ? `${API_BASE_URL}/faqs/?category_id=${categoryId}`
    : `${API_BASE_URL}/faqs/`;

  const res = await fetch(url);
  return res.json();
};

// ── My Requests (needs auth token) ───────────────────────────
export async function fetchMyRequests() {
  const token = await getToken();
  const res = await fetch(ENDPOINTS.trackReq, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch requests');
  return res.json();
  // returns: [{ id, user, procedure, status, created_at, updated_at }]
}

// ── Submit Request (needs auth token) ────────────────────────
export async function submitRequest(procedureId: number) {
  const token = await getToken();
  const res = await fetch(ENDPOINTS.submitReq, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ procedure: procedureId }),
  });
  if (!res.ok) throw new Error('Failed to submit request');
  return res.json();
}

export async function updateProfile(
  id_number?: string,
  email?: string,
  password?: string,
  student_name?: string,
  program?: string,
  year_level?: number
) {
  const token = await getToken();

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

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to update profile");
  }

  return data;
}