import { pickContentFields } from "../utils/contentFields.js";
import * as subjectsApi from "./dataApi/subjects.js";

// The owner is always the verified token user; server-data enforces it again.
export const listSubjects = (userId) => subjectsApi.listSubjects(userId);

export const getSubject = (userId, subjectId) => subjectsApi.getSubject(userId, subjectId);

export function createSubject(userId, body) {
  return subjectsApi.createSubject(userId, pickContentFields(body, { requireName: true }));
}

export function updateSubject(userId, subjectId, body) {
  return subjectsApi.updateSubject(
    userId,
    subjectId,
    pickContentFields(body, { requireName: false }),
  );
}

export const deleteSubject = (userId, subjectId) => subjectsApi.deleteSubject(userId, subjectId);
