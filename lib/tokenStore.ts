let _token: string | null = null;

export function saveToken(token: string) {
  _token = token;
}

export function getStoredToken(): string | null {
  return _token;
}

export function clearToken() {
  _token = null;
}