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
