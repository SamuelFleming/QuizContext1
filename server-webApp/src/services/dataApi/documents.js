import { userScopedRequest } from "./client.js";

const documentPath = (documentId) => `/documents/${encodeURIComponent(documentId)}`;

export function listDocuments(userId, subjectId, topicId) {
  const query = topicId ? `?topicId=${encodeURIComponent(topicId)}` : "";
  return userScopedRequest(userId, `/subjects/${encodeURIComponent(subjectId)}/documents${query}`);
}

export const createDocument = (userId, values) =>
  userScopedRequest(userId, "/documents", { method: "POST", body: values });

export const getDocument = (userId, documentId) =>
  userScopedRequest(userId, documentPath(documentId));

export const updateDocument = (userId, documentId, values) =>
  userScopedRequest(userId, documentPath(documentId), { method: "PATCH", body: values });

export const deleteDocument = (userId, documentId) =>
  userScopedRequest(userId, documentPath(documentId), { method: "DELETE" });
