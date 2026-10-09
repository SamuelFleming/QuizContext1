import { createHttpError } from "../../utils/httpError.js";
import { dataApiUrl, internalHeaders } from "./client.js";

// Create a user with an already-hashed password. Returns the public user (no hash).
export async function createUser({ email, passwordHash, displayName }) {
  const response = await fetch(dataApiUrl("/users"), {
    method: "POST",
    headers: internalHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email, passwordHash, displayName }),
  });
  if (response.status === 409) {
    throw createHttpError(409, "An account with that email already exists");
  }
  if (!response.ok) {
    throw createHttpError(502, "Could not create the user");
  }
  const body = await response.json();
  return body?.data ?? null;
}

// Login lookup. Returns the user including passwordHash, or null when not found.
export async function findUserByEmail(email) {
  const response = await fetch(dataApiUrl(`/users/by-email?email=${encodeURIComponent(email)}`), {
    headers: internalHeaders(),
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw createHttpError(502, "Could not look up the user");
  }
  const body = await response.json();
  return body?.data ?? null;
}

// Read the current user by trusted id. Never returns the hash.
export async function getCurrentUser(userId) {
  const response = await fetch(dataApiUrl("/users/me"), {
    headers: internalHeaders({ "X-User-Id": userId }),
  });
  if (response.status === 404) {
    throw createHttpError(404, "User not found");
  }
  if (!response.ok) {
    throw createHttpError(502, "Could not read the user");
  }
  const body = await response.json();
  return body?.data ?? null;
}

// Update the current user's profile. Only displayName is sent.
export async function updateCurrentUser(userId, { displayName }) {
  const response = await fetch(dataApiUrl("/users/me"), {
    method: "PATCH",
    headers: internalHeaders({ "X-User-Id": userId, "Content-Type": "application/json" }),
    body: JSON.stringify({ displayName }),
  });
  if (response.status === 400 || response.status === 404) {
    const body = await response.json().catch(() => ({}));
    throw createHttpError(response.status, body?.message || "Could not update the profile");
  }
  if (!response.ok) {
    throw createHttpError(502, "Could not update the profile");
  }
  const body = await response.json();
  return body?.data ?? null;
}
