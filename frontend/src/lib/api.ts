export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      if (typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
        window.location.href = "/login";
      }
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "API Error");
  }

  return response.json();
}
