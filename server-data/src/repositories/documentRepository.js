import mongoose from "mongoose";
import { Document } from "../models/document.js";

// Every query is scoped to the trusted owner. Callers check subject/topic ownership first.
export async function createDocument(userId, { subjectId, topicId, ...values }) {
  return Document.create({ ...values, userId, subjectId, topicId: topicId || null });
}

// topicId undefined lists the whole subject; null lists documents attached to the subject
// itself; an id lists one topic's documents.
export async function listDocuments(userId, subjectId, topicId) {
  const filter = { userId, subjectId };
  if (topicId !== undefined) {
    filter.topicId = topicId;
  }
  return Document.find(filter, { content: 0 }).sort({ createdAt: 1 });
}

// With content, for context assembly. topicIds null means every document in the subject.
export async function listDocumentsWithContent(userId, subjectId, topicIds) {
  const filter = { userId, subjectId };
  if (topicIds) {
    filter.topicId = { $in: topicIds };
  }
  return Document.find(filter).sort({ createdAt: 1 });
}

export async function findDocument(userId, documentId) {
  if (!mongoose.isValidObjectId(documentId)) {
    return null;
  }
  return Document.findOne({ _id: documentId, userId });
}

// Only title and content can change; a document cannot move to another subject or topic.
export async function updateDocument(userId, documentId, { title, content }) {
  if (!mongoose.isValidObjectId(documentId)) {
    return null;
  }
  const update = {};
  if (title !== undefined) update.title = title;
  if (content !== undefined) update.content = content;
  return Document.findOneAndUpdate({ _id: documentId, userId }, update, {
    new: true,
    runValidators: true,
  });
}

export async function deleteDocument(userId, documentId) {
  if (!mongoose.isValidObjectId(documentId)) {
    return null;
  }
  return Document.findOneAndDelete({ _id: documentId, userId });
}

export async function deleteDocumentsForTopics(userId, topicIds) {
  await Document.deleteMany({ userId, topicId: { $in: topicIds } });
}

export async function deleteDocumentsForSubject(userId, subjectId) {
  await Document.deleteMany({ userId, subjectId });
}

// Own-document counts and content character sums. topicId null is the subject itself.
// Bodies are not loaded into list responses; length is aggregated with $strLenCP.
export async function countDocumentsByOwner(userId, subjectIds) {
  if (!subjectIds.length) return [];
  return Document.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        subjectId: { $in: subjectIds.map((id) => new mongoose.Types.ObjectId(id)) },
      },
    },
    {
      $group: {
        _id: { subjectId: "$subjectId", topicId: "$topicId" },
        count: { $sum: 1 },
        contentChars: { $sum: { $strLenCP: { $ifNull: ["$content", ""] } } },
      },
    },
  ]);
}
