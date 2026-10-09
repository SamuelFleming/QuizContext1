import mongoose from "mongoose";
import {
  DOCUMENT_CONTENT_MAX,
  DOCUMENT_FILE_NAME_MAX,
  DOCUMENT_MIME_TYPE_MAX,
  DOCUMENT_TITLE_MAX,
} from "../constants/content.js";
import { toDocument, toDocumentSummary } from "../models/document.js";
import {
  createDocument,
  deleteDocument,
  findDocument,
  listDocuments,
  updateDocument,
} from "../repositories/documentRepository.js";
import { findSubject } from "../repositories/subjectRepository.js";
import { findTopic } from "../repositories/topicRepository.js";
import { sendData, sendMessage } from "../utils/responses.js";

function readDocumentInput(body) {
  const { title, content, originalFileName = "", mimeType = "", sizeBytes = 0 } = body || {};
  if (typeof title !== "string" || !title.trim() || title.trim().length > DOCUMENT_TITLE_MAX) {
    return { error: `title must be 1-${DOCUMENT_TITLE_MAX} characters` };
  }
  if (typeof content !== "string" || !content.trim() || content.length > DOCUMENT_CONTENT_MAX) {
    return { error: `content must be 1-${DOCUMENT_CONTENT_MAX} characters` };
  }
  if (typeof originalFileName !== "string" || originalFileName.length > DOCUMENT_FILE_NAME_MAX) {
    return { error: "originalFileName is invalid" };
  }
  if (typeof mimeType !== "string" || mimeType.length > DOCUMENT_MIME_TYPE_MAX) {
    return { error: "mimeType is invalid" };
  }
  if (!Number.isInteger(sizeBytes) || sizeBytes < 0) {
    return { error: "sizeBytes must be a non-negative integer" };
  }
  return { values: { title: title.trim(), content, originalFileName, mimeType, sizeBytes } };
}

// Resolves an optional topic within an owned subject. Returns { error, status } or { topic }.
async function resolveTopic(userId, subject, topicId) {
  if (topicId === null || topicId === undefined) {
    return { topic: null };
  }
  if (typeof topicId !== "string" || !mongoose.isValidObjectId(topicId)) {
    return { status: 400, error: "topicId must be a topic id or null" };
  }
  const topic = await findTopic(userId, topicId);
  if (!topic || !topic.subjectId.equals(subject._id)) {
    return { status: 404, error: "Topic not found" };
  }
  return { topic };
}

// The subject, and the topic when given, must belong to X-User-Id and to each other.
export async function create(req, res, next) {
  try {
    const { error, values } = readDocumentInput(req.body);
    if (error) {
      sendMessage(res, 400, error);
      return;
    }
    const subject = await findSubject(req.userId, req.body?.subjectId);
    if (!subject) {
      sendMessage(res, 404, "Subject not found");
      return;
    }
    const resolved = await resolveTopic(req.userId, subject, req.body?.topicId);
    if (resolved.error) {
      sendMessage(res, resolved.status, resolved.error);
      return;
    }
    const doc = await createDocument(req.userId, {
      ...values,
      subjectId: subject._id,
      topicId: resolved.topic?._id ?? null,
    });
    sendData(res, toDocument(doc), 201);
  } catch (err) {
    next(err);
  }
}

// ?topicId=<id> lists one topic, ?topicId=none lists subject-level documents, and no
// topicId lists every document in the subject.
export async function listForSubject(req, res, next) {
  try {
    const subject = await findSubject(req.userId, req.params.subjectId);
    if (!subject) {
      sendMessage(res, 404, "Subject not found");
      return;
    }
    let topicFilter;
    const { topicId } = req.query;
    if (topicId === "none") {
      topicFilter = null;
    } else if (topicId !== undefined) {
      const resolved = await resolveTopic(req.userId, subject, topicId);
      if (resolved.error) {
        sendMessage(res, resolved.status, resolved.error);
        return;
      }
      topicFilter = resolved.topic._id;
    }
    const docs = await listDocuments(req.userId, subject._id, topicFilter);
    sendData(res, docs.map(toDocumentSummary));
  } catch (err) {
    next(err);
  }
}

// Only title and content are read from the body; ids and metadata are ignored.
function readDocumentChanges(body) {
  const { title, content } = body || {};
  const values = {};
  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim() || title.trim().length > DOCUMENT_TITLE_MAX) {
      return { error: `title must be 1-${DOCUMENT_TITLE_MAX} characters` };
    }
    values.title = title.trim();
  }
  if (content !== undefined) {
    if (typeof content !== "string" || !content.trim() || content.length > DOCUMENT_CONTENT_MAX) {
      return { error: `content must be 1-${DOCUMENT_CONTENT_MAX} characters` };
    }
    values.content = content;
  }
  return { values };
}

export async function update(req, res, next) {
  try {
    const { error, values } = readDocumentChanges(req.body);
    if (error) {
      sendMessage(res, 400, error);
      return;
    }
    const doc = await updateDocument(req.userId, req.params.documentId, values);
    if (!doc) {
      sendMessage(res, 404, "Document not found");
      return;
    }
    sendData(res, toDocument(doc));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const doc = await deleteDocument(req.userId, req.params.documentId);
    if (!doc) {
      sendMessage(res, 404, "Document not found");
      return;
    }
    sendData(res, { id: doc._id.toString() });
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const doc = await findDocument(req.userId, req.params.documentId);
    if (!doc) {
      sendMessage(res, 404, "Document not found");
      return;
    }
    sendData(res, toDocument(doc));
  } catch (err) {
    next(err);
  }
}
