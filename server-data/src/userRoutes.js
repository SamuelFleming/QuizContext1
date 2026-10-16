import { Router } from "express";
import { sendData, sendMessage } from "./http.js";
import { requireInternalKey, requireUserId } from "./internalAuth.js";
import { toAuthUser, toPublicUser } from "./models/user.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  isDuplicateKeyError,
} from "./userRepository.js";

export const userRoutes = Router();

// Every user route requires the internal API key. These routes are not browser-reachable.
userRoutes.use(requireInternalKey);

// Create a user. The business API has already hashed the password.
userRoutes.post("/", async (req, res, next) => {
  try {
    const { email, passwordHash, displayName } = req.body || {};
    if (!email || !passwordHash || !displayName) {
      sendMessage(res, 400, "email, passwordHash, and displayName are required");
      return;
    }
    const user = await createUser({ email, passwordHash, displayName });
    sendData(res, toPublicUser(user), 201);
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      sendMessage(res, 409, "A user with that email already exists");
      return;
    }
    next(err);
  }
});

// Login lookup by email. This response may include passwordHash so the business API can
// compare it. It is keyed and never exposed to the browser.
userRoutes.get("/by-email", async (req, res, next) => {
  try {
    const user = await findUserByEmail(req.query.email);
    if (!user) {
      sendMessage(res, 404, "User not found");
      return;
    }
    sendData(res, toAuthUser(user));
  } catch (err) {
    next(err);
  }
});

// Read the current user from the trusted X-User-Id header. Never returns the hash and
// never returns a different user than the one identified by the header.
userRoutes.get("/me", requireUserId, async (req, res, next) => {
  try {
    const user = await findUserById(req.userId);
    if (!user) {
      sendMessage(res, 404, "User not found");
      return;
    }
    sendData(res, toPublicUser(user));
  } catch (err) {
    next(err);
  }
});
