import { userScopedRequest } from "./client.js";

export const createQuiz = (userId, values) =>
  userScopedRequest(userId, "/quizzes", { method: "POST", body: values });

export const getQuiz = (userId, quizId) =>
  userScopedRequest(userId, `/quizzes/${encodeURIComponent(quizId)}`);

export const listQuizzes = (userId, limit) => {
  const query = limit ? `?limit=${encodeURIComponent(limit)}` : "";
  return userScopedRequest(userId, `/quizzes${query}`);
};

export const listQuizAttempts = (userId, quizId) =>
  userScopedRequest(userId, `/quizzes/${encodeURIComponent(quizId)}/attempts`);

export const deleteQuiz = (userId, quizId) =>
  userScopedRequest(userId, `/quizzes/${encodeURIComponent(quizId)}`, { method: "DELETE" });
