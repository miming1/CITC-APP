const TOKEN_KEY = "citc_token";
const REMEMBERED_IDS_KEY = "citc_remembered_ids"; 
const LEGACY_REMEMBERED_ID_KEY = "citc_remembered_id"; 
const MAX_REMEMBERED = 5;

let _token: string | null = null;

export function saveToken(token: string) {
  _token = token;

  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getStoredToken(): string | null {
  if (_token) {
    return _token;
  }

  if (typeof window !== "undefined") {
    _token = localStorage.getItem(TOKEN_KEY);
  }

  return _token;
}

export function clearToken() {
  _token = null;

  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// =========================
// REMEMBERED ID NUMBERS
// =========================

function readIdsList(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(REMEMBERED_IDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }

    const legacy = localStorage.getItem(LEGACY_REMEMBERED_ID_KEY);
    if (legacy) {
      writeIdsList([legacy]);
      localStorage.removeItem(LEGACY_REMEMBERED_ID_KEY);
      return [legacy];
    }

    return [];
  } catch {
    return [];
  }
}

function writeIdsList(ids: string[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(REMEMBERED_IDS_KEY, JSON.stringify(ids));
  }
}

export function saveRememberedId(id_number: string) {
  const existing = readIdsList().filter((id) => id !== id_number);
  const updated = [id_number, ...existing].slice(0, MAX_REMEMBERED);
  writeIdsList(updated);
}

export function getRememberedIds(): string[] {
  return readIdsList();
}

// Most recently used ID — for pre-filling the field by default
export function getRememberedId(): string | null {
  const ids = readIdsList();
  return ids.length > 0 ? ids[0] : null;
}

export function removeRememberedId(id_number: string) {
  const updated = readIdsList().filter((id) => id !== id_number);
  writeIdsList(updated);
}

export function clearRememberedId() {
  writeIdsList([]);
}