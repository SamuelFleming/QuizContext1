import jwt from "jsonwebtoken";
import { sendMessage } from "../utils/responses.js";

// Verify a Bearer token and attach the trusted user id. Missing, invalid, or expired
// tokens are rejected with 401 and never passed downstream.
export function requireAuth(req, res, next) {
  const header = req.get("Authorization") || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    sendMessage(res, 401, "Authentication required");
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "");
    req.userId = payload.sub;
    next();
  } catch {
    sendMessage(res, 401, "Invalid or expired token");
  }
}
