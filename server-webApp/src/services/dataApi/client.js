import { createHttpError } from "../../utils/httpError.js";

export function dataApiUrl(path) {
  return `${process.env.DATA_API_BASE_URL || "http://localhost:4007"}${path}`;
}

// Internal headers prove server-webApp is the caller. X-User-Id, when passed, is the
// trusted acting user derived from a verified JWT. See CLAUDE.md §Architecture.
export function internalHeaders(extra = {}) {
  return {
    "X-Internal-Api-Key": process.env.INTERNAL_API_KEY || "",
    ...extra,
  };
}

// User-scoped call to server-data. Passes 400/404 messages through; other failures are 502.
export async function userScopedRequest(userId, path, { method = "GET", body } = {}) {
  const headers = internalHeaders({ "X-User-Id": userId });
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(dataApiUrl(path), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 400 || response.status === 404) {
    throw createHttpError(response.status, payload?.message || "Request failed");
  }
  if (!response.ok) {
    throw createHttpError(502, "The data service could not complete the request");
  }
  return payload?.data ?? null;
}
