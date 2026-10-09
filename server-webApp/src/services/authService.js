import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH } from "../constants/validation.js";
import { createHttpError } from "../utils/httpError.js";
import { createUser, findUserByEmail } from "./dataApi/users.js";

const BCRYPT_ROUNDS = 10;
const TOKEN_TTL = "7d";
// Same message for unknown email and wrong password, so the response does not reveal which.
const INVALID_CREDENTIALS = "Invalid email or password";

async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(password, passwordHash) {
  if (!passwordHash) {
    return false;
  }
  return bcrypt.compare(password, passwordHash);
}

// The token's user id is the only user identity the server trusts. JWT_SECRET lives in
// the server-webApp environment and is never sent to the browser or server-data.
function issueToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw createHttpError(500, "Server is missing JWT configuration", { expose: false });
  }
  return jwt.sign({}, secret, { subject: String(userId), expiresIn: TOKEN_TTL });
}

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export async function register(body) {
  const email = normalizeEmail(body?.email);
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!EMAIL_PATTERN.test(email)) {
    throw createHttpError(400, "A valid email is required");
  }
  if (!displayName) {
    throw createHttpError(400, "A display name is required");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw createHttpError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ email, passwordHash, displayName });
  return { token: issueToken(user.id), user };
}

export async function login(body) {
  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    throw createHttpError(400, "Email and password are required");
  }

  const found = await findUserByEmail(email);
  const passwordOk = found ? await verifyPassword(password, found.passwordHash) : false;
  if (!found || !passwordOk) {
    throw createHttpError(401, INVALID_CREDENTIALS);
  }

  const user = { id: found.id, email: found.email, displayName: found.displayName };
  return { token: issueToken(found.id), user };
}
