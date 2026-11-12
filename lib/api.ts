import { API_BASE_URL, ENDPOINTS } from '../constants/api';
import { getToken } from './auth';

// ── Procedures ────────────────────────────────────────────────
export async function fetchProcedures() {
  const token = await getToken();

  const res = await fetch(`${API_BASE_URL}/procedures/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`, // 🔥 THIS is what you were missing
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.detail || "Failed to fetch procedures");
  }

  return data;
}

// ── FAQs ──────────────────────────────────────────────────────
export async function fetchFAQs(categoryId?: string) {
  try {
    const token = await getToken();

    const url = categoryId
      ? `${API_BASE_URL}/faqs/?category_id=${categoryId}`
      : `${API_BASE_URL}/faqs/`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`, // 🔥 THIS WAS MISSING
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Failed to fetch FAQs");
    }

    return data;
  } catch (err) {
    console.log("fetchFAQs error:", err);
    return [];
  }
}

// ── FAQ Categories ─────────────────────────────────────────────
export async function fetchFAQCategories() {
  try {
    const token = await getToken();

    const res = await fetch(`${API_BASE_URL}/faq-categories/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Failed to fetch FAQ categories");
    }

    return data;
  } catch (err) {
    console.log("fetchFAQCategories error:", err);
    return [];
  }
}

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

// ── Fetch Requests ───────────────────────────
export async function fetchActiveRequests() {
  const token = await getToken();

  const res = await fetch(ENDPOINTS.activeReq, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch active requests");
  }

  return res.json();
}

// ── Search Request (Admin) ───────────────────────────
export async function searchRequestByReference(referenceCode: string) {
  const token = await getToken();

  const res = await fetch(ENDPOINTS.searchRequest, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({
      reference_code: referenceCode,
    }),
  });

  if (!res.ok) {
    throw new Error("Request not found");
  }

  return res.json();
}

// ── Update Request Status (Admin) ───────────────────────────
export async function updateRequestStatus(
  requestId: number,
  status: string,
  remarks: string
) {
  const token = await getToken();

  const res = await fetch(
    `${API_BASE_URL}/requests/${requestId}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        status,
        remarks,
      }),
    }
  );

  const data = await res.json();

  console.log("STATUS CODE:", res.status);
  console.log("UPDATE RESPONSE:", data);

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
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

export async function fetchAdminStatistics() {

  const token = await getToken();

  const res = await fetch(
    `${API_BASE_URL}/admin/statistics/`,
    {
      headers:{
        Authorization:`Token ${token}`,
      },
    }
  );


  if(!res.ok){
    throw new Error(
      "Failed to fetch admin statistics"
    );
  }


  return res.json();
}