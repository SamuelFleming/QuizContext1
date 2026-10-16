import mongoose from "mongoose";
import { User } from "./models/user.js";

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

export function isDuplicateKeyError(err) {
  return err && err.code === 11000;
}
