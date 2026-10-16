import { userScopedRequest } from "./client.js";

const attemptPath = (attemptId) => `/attempts/${encodeURIComponent(attemptId)}`;

export const listRecentAttempts = (userId, limit) => {
  const query = limit ? `?limit=${encodeURIComponent(limit)}` : "";
  return userScopedRequest(userId, `/attempts${query}`);
};

export const createAttempt = (userId, quizId) =>
  userScopedRequest(userId, "/attempts", { method: "POST", body: { quizId } });

export const getAttempt = (userId, attemptId) => userScopedRequest(userId, attemptPath(attemptId));

export const saveAttemptResponses = (userId, attemptId, responses) =>
  userScopedRequest(userId, attemptPath(attemptId), { method: "PATCH", body: { responses } });

export const submitAttempt = (userId, attemptId, responses) =>
  userScopedRequest(userId, `${attemptPath(attemptId)}/submit`, { method: "POST", body: { responses } });

export const saveAttemptEvaluation = (userId, attemptId, body) =>
  userScopedRequest(userId, `${attemptPath(attemptId)}/evaluation`, { method: "PUT", body });
