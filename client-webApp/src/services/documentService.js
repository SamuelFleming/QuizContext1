import { request } from "./apiClient.js";

const documentPath = (documentId) => `/documents/${encodeURIComponent(documentId)}`;

// topicId null lists documents attached to the subject itself.
export const listDocuments = (subjectId, topicId) =>
  request(
    `/subjects/${encodeURIComponent(subjectId)}/documents?topicId=${encodeURIComponent(topicId ?? "none")}`,
    { auth: true },
  );

export function extractDocument(file) {
  const form = new FormData();
  form.append("file", file);
  return request("/documents/extract", { method: "POST", body: form, auth: true });
}

export const createDocument = (payload) =>
  request("/documents", { method: "POST", body: payload, auth: true });
export const getDocument = (documentId) => request(documentPath(documentId), { auth: true });
export const updateDocument = (documentId, payload) =>
  request(documentPath(documentId), { method: "PATCH", body: payload, auth: true });
export const deleteDocument = (documentId) =>
  request(documentPath(documentId), { method: "DELETE", auth: true });
