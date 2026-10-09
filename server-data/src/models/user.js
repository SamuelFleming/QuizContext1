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
    displayName: { type: String, required: true, trim: true, maxlength: 80 },
    aiAccessMode: { type: String, enum: ["application", "user"], default: "application" },
    // Encrypted by server-webApp (AES-256-GCM). server-data never sees the plaintext key.
    aiKey: {
      type: new mongoose.Schema(
        {
          ciphertext: { type: String, required: true },
          iv: { type: String, required: true },
          authTag: { type: String, required: true },
          keyVersion: { type: Number, required: true },
          updatedAt: { type: Date, required: true },
        },
        { _id: false },
      ),
      default: undefined,
    },
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

// AI settings status. Says whether a key is set, never the blob.
export function toAiSettings(doc) {
  if (!doc) {
    return null;
  }
  return {
    aiAccessMode: doc.aiAccessMode || "application",
    hasUserKey: Boolean(doc.aiKey?.ciphertext),
    keyUpdatedAt: doc.aiKey?.updatedAt ?? null,
  };
}

// Shape returned only for the keyed login lookup. Includes passwordHash on purpose.
export function toAuthUser(doc) {
  if (!doc) {
    return null;
  }
  return { ...toPublicUser(doc), passwordHash: doc.passwordHash };
}
