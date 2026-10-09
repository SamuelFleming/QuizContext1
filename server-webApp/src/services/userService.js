import { DISPLAY_NAME_MAX } from "../constants/validation.js";
import { createHttpError } from "../utils/httpError.js";
import { getCurrentUser, updateCurrentUser } from "./dataApi/users.js";

// The user id always comes from the verified token, never the request body.
export async function getProfile(userId) {
  const user = await getCurrentUser(userId);
  if (!user) {
    throw createHttpError(404, "User not found");
  }
  return user;
}

export async function updateProfile(userId, body) {
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
  if (!displayName) {
    throw createHttpError(400, "A display name is required");
  }
  if (displayName.length > DISPLAY_NAME_MAX) {
    throw createHttpError(400, `Display name must be at most ${DISPLAY_NAME_MAX} characters`);
  }
  return updateCurrentUser(userId, { displayName });
}
