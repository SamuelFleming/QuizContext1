import { Router } from "express";
import { requireAuth } from "./auth.js";
import { getCurrentUser, updateCurrentUser } from "./dataClient.js";
import { sendData, sendMessage } from "./http.js";

export const userRoutes = Router();

const MAX_DISPLAY_NAME = 80;

// Returns only the signed-in user. The id comes from the verified token, never the body.
userRoutes.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.userId);
    if (!user) {
      sendMessage(res, 404, "User not found");
      return;
    }
    sendData(res, user);
  } catch (err) {
    next(err);
  }
});

userRoutes.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const displayName = typeof req.body?.displayName === "string" ? req.body.displayName.trim() : "";
    if (!displayName) {
      sendMessage(res, 400, "A display name is required");
      return;
    }
    if (displayName.length > MAX_DISPLAY_NAME) {
      sendMessage(res, 400, `Display name must be at most ${MAX_DISPLAY_NAME} characters`);
      return;
    }
    const user = await updateCurrentUser(req.userId, { displayName });
    sendData(res, user);
  } catch (err) {
    next(err);
  }
});
