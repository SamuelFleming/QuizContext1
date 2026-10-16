import { userScopedRequest } from "./client.js";

export const getAiSettings = (userId) => userScopedRequest(userId, "/users/me/ai-settings");

export const setAiAccessMode = (userId, aiAccessMode) =>
  userScopedRequest(userId, "/users/me/ai-settings/mode", { method: "PUT", body: { aiAccessMode } });

export const setAiKeyBlob = (userId, blob) =>
  userScopedRequest(userId, "/users/me/ai-key", { method: "PUT", body: blob });

export const removeAiKeyBlob = (userId) =>
  userScopedRequest(userId, "/users/me/ai-key", { method: "DELETE" });

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
