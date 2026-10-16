import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);

// Shape returned to the business API for ordinary reads. Never includes passwordHash.
export function toPublicUser(doc) {
  if (!doc) {
    return null;
  }
  return {
    id: doc._id.toString(),
    email: doc.email,
    displayName: doc.displayName,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// Shape returned only for the keyed login lookup. Includes passwordHash on purpose.
export function toAuthUser(doc) {
  if (!doc) {
    return null;
  }
  return { ...toPublicUser(doc), passwordHash: doc.passwordHash };
}
