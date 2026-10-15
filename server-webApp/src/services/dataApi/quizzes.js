import { userScopedRequest } from "./client.js";

export const createQuiz = (userId, values) =>
  userScopedRequest(userId, "/quizzes", { method: "POST", body: values });

export const getQuiz = (userId, quizId) =>
  userScopedRequest(userId, `/quizzes/${encodeURIComponent(quizId)}`);

export const listQuizzes = (userId, filters) => {
  const query = new URLSearchParams();
  query.set("page", String(filters.page));
  query.set("limit", String(filters.limit));
  query.set("sort", filters.sort);
  for (const topicId of filters.topicIds) query.append("topicIds", topicId);
  for (const name of ["questionCount", "multipleChoiceCount", "shortAnswerCount"]) {
    if (filters[name] !== undefined) query.set(name, String(filters[name]));
  }
  return userScopedRequest(userId, `/quizzes?${query.toString()}`);
};

export const listQuizAttempts = (userId, quizId) =>
  userScopedRequest(userId, `/quizzes/${encodeURIComponent(quizId)}/attempts`);

export const updateQuizTitle = (userId, quizId, title) =>
  userScopedRequest(userId, `/quizzes/${encodeURIComponent(quizId)}`, {
    method: "PATCH",
    body: { title },
  });

export const deleteQuiz = (userId, quizId) =>
  userScopedRequest(userId, `/quizzes/${encodeURIComponent(quizId)}`, { method: "DELETE" });
