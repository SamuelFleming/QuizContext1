import {
  DOCUMENT_CONTENT_MAX,
  DOCUMENT_FILE_NAME_MAX,
  DOCUMENT_TITLE_MAX,
} from "../constants/validation.js";
import { createHttpError } from "../utils/httpError.js";
import * as documentsApi from "./dataApi/documents.js";
import { extractDocument } from "./documentExtractionService.js";

export const extract = (file) => extractDocument(file);

function readTitleAndContent(body, { partial = false } = {}) {
  const values = {};
  const { title, content } = body || {};
  if (title !== undefined || !partial) {
    const trimmed = typeof title === "string" ? title.trim() : "";
    if (!trimmed) {
      throw createHttpError(400, "A title is required");
    }
    if (trimmed.length > DOCUMENT_TITLE_MAX) {
      throw createHttpError(400, `Title must be at most ${DOCUMENT_TITLE_MAX} characters`);
    }
    values.title = trimmed;
  }
  if (content !== undefined || !partial) {
    if (typeof content !== "string" || !content.trim()) {
      throw createHttpError(400, "Document text cannot be empty");
    }
    if (content.length > DOCUMENT_CONTENT_MAX) {
      throw createHttpError(
        400,
        `Document text must be at most ${DOCUMENT_CONTENT_MAX.toLocaleString("en")} characters`,
      );
    }
    values.content = content;
  }
  return values;
}

// Saves reviewed text. server-data checks the subject and topic belong to the token user.
export function createDocument(userId, body) {
  const values = readTitleAndContent(body);
  const { subjectId, topicId = null, originalFileName = "", mimeType = "", sizeBytes = 0 } =
    body || {};
  if (typeof subjectId !== "string" || !subjectId) {
    throw createHttpError(400, "subjectId is required");
  }
  if (topicId !== null && typeof topicId !== "string") {
    throw createHttpError(400, "topicId must be a topic id or null");
  }
  return documentsApi.createDocument(userId, {
    ...values,
    subjectId,
    topicId,
    originalFileName: String(originalFileName).slice(0, DOCUMENT_FILE_NAME_MAX),
    mimeType: String(mimeType).slice(0, 100),
    sizeBytes: Number.isInteger(sizeBytes) && sizeBytes >= 0 ? sizeBytes : 0,
  });
}

export const listDocuments = (userId, subjectId, topicId) =>
  documentsApi.listDocuments(userId, subjectId, typeof topicId === "string" ? topicId : undefined);

export const getDocument = (userId, documentId) => documentsApi.getDocument(userId, documentId);

export function updateDocument(userId, documentId, body) {
  const values = readTitleAndContent(body, { partial: true });
  if (!Object.keys(values).length) {
    throw createHttpError(400, "Provide a title or document text to update");
  }
  return documentsApi.updateDocument(userId, documentId, values);
}

export const deleteDocument = (userId, documentId) =>
  documentsApi.deleteDocument(userId, documentId);
