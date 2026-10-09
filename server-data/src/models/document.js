import mongoose from "mongoose";
import {
  DOCUMENT_CONTENT_MAX,
  DOCUMENT_FILE_NAME_MAX,
  DOCUMENT_MIME_TYPE_MAX,
  DOCUMENT_TITLE_MAX,
} from "../constants/content.js";

// Only the user-reviewed text and light file metadata are stored, never the original file.
const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", default: null, index: true },
    title: { type: String, required: true, trim: true, maxlength: DOCUMENT_TITLE_MAX },
    content: { type: String, required: true, maxlength: DOCUMENT_CONTENT_MAX },
    originalFileName: { type: String, default: "", maxlength: DOCUMENT_FILE_NAME_MAX },
    mimeType: { type: String, default: "", maxlength: DOCUMENT_MIME_TYPE_MAX },
    sizeBytes: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

export const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);

export function toDocumentSummary(doc) {
  if (!doc) {
    return null;
  }
  return {
    id: doc._id.toString(),
    subjectId: doc.subjectId.toString(),
    topicId: doc.topicId ? doc.topicId.toString() : null,
    title: doc.title,
    originalFileName: doc.originalFileName,
    mimeType: doc.mimeType,
    sizeBytes: doc.sizeBytes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function toDocument(doc) {
  if (!doc) {
    return null;
  }
  return { ...toDocumentSummary(doc), content: doc.content };
}
