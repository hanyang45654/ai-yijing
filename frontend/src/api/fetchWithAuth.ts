const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function fetchWithAuth(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    const incoming = options.headers as Record<string, string>;
    Object.assign(headers, incoming);
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${path}`, { ...options, headers });
}
