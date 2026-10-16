import mongoose from "mongoose";
import { User } from "../models/user.js";

// Persistence for the User collection. The business API supplies the passwordHash;
// server-data never hashes passwords or issues tokens.
export async function createUser({ email, passwordHash, displayName }) {
  const user = await User.create({ email, passwordHash, displayName });
  return user;
}

export async function findUserByEmail(email) {
  if (!email) {
    return null;
  }
  return User.findOne({ email: String(email).toLowerCase().trim() });
}

export async function findUserById(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }
  return User.findById(id);
}

// Only fields on this list can change through a profile update.
const UPDATABLE_FIELDS = ["displayName"];

export async function updateUserById(id, changes) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }
  const update = {};
  for (const field of UPDATABLE_FIELDS) {
    if (changes[field] !== undefined) {
      update[field] = changes[field];
    }
  }
  return User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
}

export async function setAiAccessMode(id, aiAccessMode) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }
  return User.findByIdAndUpdate(id, { aiAccessMode }, { new: true, runValidators: true });
}

export async function setAiKey(id, { ciphertext, iv, authTag, keyVersion }) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }
  const aiKey = { ciphertext, iv, authTag, keyVersion, updatedAt: new Date() };
  return User.findByIdAndUpdate(id, { aiKey }, { new: true, runValidators: true });
}

export async function removeAiKey(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }
  return User.findByIdAndUpdate(id, { $unset: { aiKey: 1 } }, { new: true });
}

export function isDuplicateKeyError(err) {
  return err && err.code === 11000;
}
