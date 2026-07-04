const TOKEN_KEY = "citc_token";

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