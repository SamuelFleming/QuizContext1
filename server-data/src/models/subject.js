import mongoose from "mongoose";
import {
  CONTENT_DESCRIPTION_MAX,
  CONTENT_NAME_MAX,
  CONTENT_NOTES_MAX,
} from "../constants/content.js";

const subjectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: CONTENT_NAME_MAX },
    description: { type: String, default: "", maxlength: CONTENT_DESCRIPTION_MAX },
    notes: { type: String, default: "", maxlength: CONTENT_NOTES_MAX },
  },
  { timestamps: true },
);

export const Subject = mongoose.models.Subject || mongoose.model("Subject", subjectSchema);

export function toSubject(doc) {
  if (!doc) {
    return null;
  }
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    notes: doc.notes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
