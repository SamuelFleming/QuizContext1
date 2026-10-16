import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMessage } from "./http.js";

const BCRYPT_ROUNDS = 10;
const TOKEN_TTL = "7d";

export async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password, passwordHash) {
  if (!passwordHash) {
    return false;
  }
  return bcrypt.compare(password, passwordHash);
}

// The token's user id is the only user identity the server trusts. JWT_SECRET lives in
// the server-webApp environment and is never sent to the browser or server-data.
export function issueToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error("Server is missing JWT configuration");
    err.statusCode = 500;
    throw err;
  }
  return jwt.sign({}, secret, { subject: String(userId), expiresIn: TOKEN_TTL });
}

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
