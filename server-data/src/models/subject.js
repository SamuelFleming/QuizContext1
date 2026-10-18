import mongoose from "mongoose";
import {
  CONTENT_DESCRIPTION_MAX,
  CONTENT_NAME_MAX,
  CONTENT_NOTES_MAX,
} from "../constants/content.js";
import { contentFacts } from "../utils/completeness.js";

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

export function toSubject(doc, stats) {
  if (!doc) {
    return null;
  }
  const subject = {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    notes: doc.notes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
  if (!stats) return subject;
  return {
    ...subject,
    ...contentFacts(doc, stats.documentCount),
    topicCount: stats.topicCount,
    contentCompleteTopicCount: stats.contentCompleteTopicCount,
    ownContentChars: stats.ownContentChars,
    subtreeContentChars: stats.subtreeContentChars,
  };
}
