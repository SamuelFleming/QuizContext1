import { Router } from "express";
import { hashPassword, issueToken, verifyPassword } from "./auth.js";
import { createUser, findUserByEmail } from "./dataClient.js";
import { sendData, sendMessage } from "./http.js";

export const authRoutes = Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
// Same message for unknown email and wrong password, so the response does not reveal which.
const INVALID_CREDENTIALS = "Invalid email or password";

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

authRoutes.post("/register", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const displayName = typeof req.body?.displayName === "string" ? req.body.displayName.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!EMAIL_PATTERN.test(email)) {
      sendMessage(res, 400, "A valid email is required");
      return;
    }
    if (!displayName) {
      sendMessage(res, 400, "A display name is required");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      sendMessage(res, 400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ email, passwordHash, displayName });
    const token = issueToken(user.id);
    sendData(res, { token, user }, 201);
  } catch (err) {
    next(err);
  }
});

authRoutes.post("/login", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      sendMessage(res, 400, "Email and password are required");
      return;
    }

    const found = await findUserByEmail(email);
    const passwordOk = found ? await verifyPassword(password, found.passwordHash) : false;
    if (!found || !passwordOk) {
      sendMessage(res, 401, INVALID_CREDENTIALS);
      return;
    }

    const token = issueToken(found.id);
    const user = { id: found.id, email: found.email, displayName: found.displayName };
    sendData(res, { token, user });
  } catch (err) {
    next(err);
  }
});
