import { Router } from "express";
import { requireAuth } from "./auth.js";
import { getCurrentUser } from "./dataClient.js";
import { sendData, sendMessage } from "./http.js";

export const userRoutes = Router();

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
