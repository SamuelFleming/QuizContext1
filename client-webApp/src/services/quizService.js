import { request } from "./apiClient.js";

export const generateQuiz = (body) => {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const input = { ...body };
  if (title) input.title = title;
  else delete input.title;
  return request("/quizzes", { method: "POST", body: input, auth: true });
};

export const previewQuiz = (body) =>
  request("/quizzes/preview", { method: "POST", body, auth: true });

export const getQuiz = (quizId) => request(`/quizzes/${encodeURIComponent(quizId)}`, { auth: true });

export const listQuizzes = ({
  page = 1,
  limit = 25,
  sort = "newest",
  topicIds = [],
  questionCount,
  multipleChoiceCount,
  shortAnswerCount,
} = {}) => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit), sort });
  for (const topicId of topicIds) query.append("topicIds", topicId);
  for (const [name, value] of Object.entries({
    questionCount,
    multipleChoiceCount,
    shortAnswerCount,
  })) {
    if (value !== undefined && value !== null && value !== "") query.set(name, String(value));
  }
  return request(`/quizzes?${query.toString()}`, { auth: true });
};

export const deleteQuiz = (quizId) =>
  request(`/quizzes/${encodeURIComponent(quizId)}`, { method: "DELETE", auth: true });

export const exportQuiz = (quizId) => request(`/quizzes/${encodeURIComponent(quizId)}/export`, { auth: true });

export const listQuizAttempts = (quizId) =>
  request(`/quizzes/${encodeURIComponent(quizId)}/attempts`, { auth: true });

export const listAttempts = (limit) => {
  const query = limit ? `?limit=${encodeURIComponent(limit)}` : "";
  return request(`/attempts${query}`, { auth: true });
};

export async function downloadQuiz(quizId) {
  const file = await exportQuiz(quizId);
  const blob = new Blob([file.markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return file;
}

export const startAttempt = (quizId) =>
  request(`/quizzes/${encodeURIComponent(quizId)}/attempts`, { method: "POST", auth: true });

const attemptPath = (attemptId) => `/attempts/${encodeURIComponent(attemptId)}`;

export const getAttempt = (attemptId) => request(attemptPath(attemptId), { auth: true });

export const saveAttempt = (attemptId, responses) =>
  request(attemptPath(attemptId), { method: "PATCH", body: { responses }, auth: true });

export const submitAttempt = (attemptId, responses) =>
  request(`${attemptPath(attemptId)}/submit`, { method: "POST", body: { responses }, auth: true });

export const evaluateAttempt = (attemptId) =>
  request(`${attemptPath(attemptId)}/evaluate`, { method: "POST", auth: true });
