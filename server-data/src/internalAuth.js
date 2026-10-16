import mongoose from "mongoose";
import { sendMessage } from "./http.js";

export function requireInternalKey(req, res, next) {
  const expected = process.env.INTERNAL_API_KEY;
  const provided = req.get("X-Internal-Api-Key");
  if (!expected || provided !== expected) {
    sendMessage(res, 401, "Unauthorized");
    return;
  }
  next();
}

// The acting user is taken from X-User-Id, which server-webApp derives from a verified
// JWT. It is trusted only because requireInternalKey already proved the caller. A user id
// in a request body or query is never authority. Use this after requireInternalKey.
export function requireUserId(req, res, next) {
  const userId = req.get("X-User-Id");
  if (!userId || !mongoose.isValidObjectId(userId)) {
    sendMessage(res, 401, "Missing or invalid user identity");
    return;
  }
  req.userId = userId;
  next();
}
