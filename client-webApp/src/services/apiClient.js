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
  constructor(status, message, code, failures = [], aiRun = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.failures = Array.isArray(failures)
      ? failures.filter((failure) => typeof failure === "string").slice(0, 20)
      : [];
    this.aiRun = aiRun && typeof aiRun === "object" ? aiRun : null;
  }
}

export async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  // FormData bodies let the browser set the multipart boundary.
  const isForm = body instanceof FormData;
  if (body !== undefined && !isForm) {
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
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
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
    throw new ApiError(
      response.status,
      payload?.message || "Request failed",
      payload?.code,
      payload?.failures,
      payload?.aiRun,
    );
  }
  return payload?.data;
}
