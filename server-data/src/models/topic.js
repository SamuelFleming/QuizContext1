import mongoose from "mongoose";
import {
  CONTENT_DESCRIPTION_MAX,
  CONTENT_NAME_MAX,
  CONTENT_NOTES_MAX,
} from "../constants/content.js";

// One collection for every level of the tree. parentTopicId is null for top-level topics.
const topicSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    parentTopicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", default: null },
    name: { type: String, required: true, trim: true, maxlength: CONTENT_NAME_MAX },
    description: { type: String, default: "", maxlength: CONTENT_DESCRIPTION_MAX },
    notes: { type: String, default: "", maxlength: CONTENT_NOTES_MAX },
  },
  { timestamps: true },
);

export const Topic = mongoose.models.Topic || mongoose.model("Topic", topicSchema);

export function toTopic(doc) {
  if (!doc) {
    return null;
  }
  return {
    id: doc._id.toString(),
    subjectId: doc.subjectId.toString(),
    parentTopicId: doc.parentTopicId ? doc.parentTopicId.toString() : null,
    name: doc.name,
    description: doc.description,
    notes: doc.notes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
