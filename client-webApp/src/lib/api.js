// Single API client for the business API. The browser calls server-webApp only.
const baseUrl = import.meta.env.VITE_WEB_API_BASE_URL || "http://localhost:4017";
const TOKEN_KEY = "quizcontext_auth_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Please try again.");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(response.status, payload?.message || "Request failed", payload?.code);
  }
  return payload?.data;
}

export const register = (payload) => request("/auth/register", { method: "POST", body: payload });
export const login = (payload) => request("/auth/login", { method: "POST", body: payload });
export const getMe = () => request("/users/me", { auth: true });
export const updateMe = (payload) =>
  request("/users/me", { method: "PATCH", body: payload, auth: true });
export const getConnectivity = () => request("/diagnostics/connectivity");
export const getAiSettings = () => request("/settings/ai", { auth: true });
export const setAiMode = (aiAccessMode) =>
  request("/settings/ai/mode", { method: "PUT", body: { aiAccessMode }, auth: true });
export const saveAiKey = (apiKey) =>
  request("/settings/ai/key", { method: "PUT", body: { apiKey }, auth: true });
export const removeAiKey = () => request("/settings/ai/key", { method: "DELETE", auth: true });
export const checkAiConnection = () => request("/settings/ai/check", { method: "POST", auth: true });
export const getAiUsage = () => request("/settings/ai/usage", { auth: true });
