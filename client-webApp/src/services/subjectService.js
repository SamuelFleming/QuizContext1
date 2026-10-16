import { request } from "./apiClient.js";

const subjectPath = (subjectId) => `/subjects/${encodeURIComponent(subjectId)}`;

export const listSubjects = () => request("/subjects", { auth: true });
export const createSubject = (payload) =>
  request("/subjects", { method: "POST", body: payload, auth: true });
export const getSubject = (subjectId) => request(subjectPath(subjectId), { auth: true });
export const updateSubject = (subjectId, payload) =>
  request(subjectPath(subjectId), { method: "PATCH", body: payload, auth: true });
export const deleteSubject = (subjectId) =>
  request(subjectPath(subjectId), { method: "DELETE", auth: true });
