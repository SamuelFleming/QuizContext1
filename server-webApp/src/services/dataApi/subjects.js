import { userScopedRequest } from "./client.js";

const subjectPath = (subjectId) => `/subjects/${encodeURIComponent(subjectId)}`;

export const listSubjects = (userId) => userScopedRequest(userId, "/subjects");

export const createSubject = (userId, values) =>
  userScopedRequest(userId, "/subjects", { method: "POST", body: values });

export const getSubject = (userId, subjectId) => userScopedRequest(userId, subjectPath(subjectId));

export const updateSubject = (userId, subjectId, values) =>
  userScopedRequest(userId, subjectPath(subjectId), { method: "PATCH", body: values });

export const deleteSubject = (userId, subjectId) =>
  userScopedRequest(userId, subjectPath(subjectId), { method: "DELETE" });
