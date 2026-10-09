import { AI_ACCESS_MODES, DISPLAY_NAME_MAX } from "../constants/user.js";
import { toAiSettings, toAuthUser, toPublicUser } from "../models/user.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  isDuplicateKeyError,
  removeAiKey,
  setAiAccessMode,
  setAiKey,
  updateUserById,
} from "../repositories/userRepository.js";
import { sendData, sendMessage } from "../utils/responses.js";

// Create a user. The business API has already hashed the password.
export async function create(req, res, next) {
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
}

// Login lookup by email. This response may include passwordHash so the business API can
// compare it. It is keyed and never exposed to the browser.
export async function getByEmail(req, res, next) {
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
}

// Read the current user from the trusted X-User-Id header. Never returns the hash and
// never returns a different user than the one identified by the header.
export async function getMe(req, res, next) {
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
}

// Update the current user's profile. Fields outside the repository allow-list are ignored,
// and the target is always X-User-Id, never an id in the body.
export async function updateMe(req, res, next) {
  try {
    const displayName = req.body?.displayName;
    if (
      typeof displayName !== "string" ||
      !displayName.trim() ||
      displayName.trim().length > DISPLAY_NAME_MAX
    ) {
      sendMessage(res, 400, `displayName must be 1-${DISPLAY_NAME_MAX} characters`);
      return;
    }
    const user = await updateUserById(req.userId, { displayName: displayName.trim() });
    if (!user) {
      sendMessage(res, 404, "User not found");
      return;
    }
    sendData(res, toPublicUser(user));
  } catch (err) {
    next(err);
  }
}

function sendAiSettings(res, user) {
  if (!user) {
    sendMessage(res, 404, "User not found");
    return;
  }
  sendData(res, toAiSettings(user));
}

export async function getAiSettings(req, res, next) {
  try {
    sendAiSettings(res, await findUserById(req.userId));
  } catch (err) {
    next(err);
  }
}

export async function updateAiAccessMode(req, res, next) {
  try {
    const mode = req.body?.aiAccessMode;
    if (!AI_ACCESS_MODES.includes(mode)) {
      sendMessage(res, 400, "aiAccessMode must be application or user");
      return;
    }
    sendAiSettings(res, await setAiAccessMode(req.userId, mode));
  } catch (err) {
    next(err);
  }
}

// Internal only: returns the encrypted blob so server-webApp can decrypt it for one call.
export async function getAiKey(req, res, next) {
  try {
    const user = await findUserById(req.userId);
    if (!user?.aiKey?.ciphertext) {
      sendMessage(res, 404, "No stored key");
      return;
    }
    const { ciphertext, iv, authTag, keyVersion } = user.aiKey;
    sendData(res, { ciphertext, iv, authTag, keyVersion });
  } catch (err) {
    next(err);
  }
}

export async function putAiKey(req, res, next) {
  try {
    const { ciphertext, iv, authTag, keyVersion } = req.body || {};
    const strings = [ciphertext, iv, authTag];
    if (strings.some((v) => typeof v !== "string" || !v) || !Number.isInteger(keyVersion)) {
      sendMessage(res, 400, "ciphertext, iv, authTag, and integer keyVersion are required");
      return;
    }
    sendAiSettings(res, await setAiKey(req.userId, { ciphertext, iv, authTag, keyVersion }));
  } catch (err) {
    next(err);
  }
}

export async function deleteAiKey(req, res, next) {
  try {
    sendAiSettings(res, await removeAiKey(req.userId));
  } catch (err) {
    next(err);
  }
}
