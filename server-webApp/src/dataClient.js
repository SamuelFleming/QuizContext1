function dataApiBaseUrl() {
  return process.env.DATA_API_BASE_URL || "http://localhost:4007";
}

// Internal headers prove server-webApp is the caller. X-User-Id, when passed, is the
// trusted acting user derived from a verified JWT. See CLAUDE.md §Architecture.
function internalHeaders(extra = {}) {
  return {
    "X-Internal-Api-Key": process.env.INTERNAL_API_KEY || "",
    ...extra,
  };
}

function httpError(status, message) {
  const err = new Error(message);
  err.statusCode = status;
  err.expose = true;
  return err;
}

export async function fetchDatabaseDiagnostic() {
  try {
    const response = await fetch(`${dataApiBaseUrl()}/diagnostics/database`, {
      headers: internalHeaders(),
    });
    if (!response.ok) {
      return { dataApi: "failed", database: "failed" };
    }
    const body = await response.json();
    return {
      dataApi: "ok",
      database: body?.data?.database === "ok" ? "ok" : "failed",
    };
  } catch {
    return { dataApi: "failed", database: "failed" };
  }
}

// Create a user with an already-hashed password. Returns the public user (no hash).
export async function createUser({ email, passwordHash, displayName }) {
  const response = await fetch(`${dataApiBaseUrl()}/users`, {
    method: "POST",
    headers: internalHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email, passwordHash, displayName }),
  });
  if (response.status === 409) {
    throw httpError(409, "An account with that email already exists");
  }
  if (!response.ok) {
    throw httpError(502, "Could not create the user");
  }
  const body = await response.json();
  return body?.data ?? null;
}

// Login lookup. Returns the user including passwordHash, or null when not found.
export async function findUserByEmail(email) {
  const response = await fetch(
    `${dataApiBaseUrl()}/users/by-email?email=${encodeURIComponent(email)}`,
    { headers: internalHeaders() },
  );
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw httpError(502, "Could not look up the user");
  }
  const body = await response.json();
  return body?.data ?? null;
}

// Update the current user's profile. Only displayName is sent.
export async function updateCurrentUser(userId, { displayName }) {
  const response = await fetch(`${dataApiBaseUrl()}/users/me`, {
    method: "PATCH",
    headers: internalHeaders({ "X-User-Id": userId, "Content-Type": "application/json" }),
    body: JSON.stringify({ displayName }),
  });
  if (response.status === 400 || response.status === 404) {
    const body = await response.json().catch(() => ({}));
    throw httpError(response.status, body?.message || "Could not update the profile");
  }
  if (!response.ok) {
    throw httpError(502, "Could not update the profile");
  }
  const body = await response.json();
  return body?.data ?? null;
}

// User-scoped call to server-data. Passes 400/404 messages through; other failures are 502.
async function userScopedRequest(userId, path, { method = "GET", body } = {}) {
  const headers = internalHeaders({ "X-User-Id": userId });
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(`${dataApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 400 || response.status === 404) {
    throw httpError(response.status, payload?.message || "Request failed");
  }
  if (!response.ok) {
    throw httpError(502, "The data service could not complete the request");
  }
  return payload?.data ?? null;
}

export const getAiSettings = (userId) => userScopedRequest(userId, "/users/me/ai-settings");

export const setAiAccessMode = (userId, aiAccessMode) =>
  userScopedRequest(userId, "/users/me/ai-settings/mode", { method: "PUT", body: { aiAccessMode } });

export const setAiKeyBlob = (userId, blob) =>
  userScopedRequest(userId, "/users/me/ai-key", { method: "PUT", body: blob });

export const removeAiKeyBlob = (userId) =>
  userScopedRequest(userId, "/users/me/ai-key", { method: "DELETE" });

export const createAiUsage = (userId, record) =>
  userScopedRequest(userId, "/ai-usage", { method: "POST", body: record });

export const getAiUsageSummary = (userId) => userScopedRequest(userId, "/ai-usage/summary");

// Returns the encrypted blob, or null when the user has no stored key.
export async function getAiKeyBlob(userId) {
  try {
    return await userScopedRequest(userId, "/users/me/ai-key");
  } catch (err) {
    if (err.statusCode === 404) {
      return null;
    }
    throw err;
  }
}

// Read the current user by trusted id. Never returns the hash.
export async function getCurrentUser(userId) {
  const response = await fetch(`${dataApiBaseUrl()}/users/me`, {
    headers: internalHeaders({ "X-User-Id": userId }),
  });
  if (response.status === 404) {
    throw httpError(404, "User not found");
  }
  if (!response.ok) {
    throw httpError(502, "Could not read the user");
  }
  const body = await response.json();
  return body?.data ?? null;
}
