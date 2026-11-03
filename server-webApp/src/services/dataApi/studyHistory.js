import { userScopedRequest } from "./client.js";

function studyHistoryQuery(query = {}) {
  const params = new URLSearchParams();
  for (const name of ["subjectId", "topicId", "quizId", "page", "limit", "n", "activity"]) {
    if (query[name] !== undefined && query[name] !== null && query[name] !== "") {
      params.set(name, String(query[name]));
    }
  }
  if (query.include) {
    params.set("include", Array.isArray(query.include) ? query.include.join(",") : String(query.include));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const getStudyHistoryResults = (userId, query) =>
  userScopedRequest(userId, `/study-history${studyHistoryQuery(query)}`);

export const getStudyHistoryAttempts = (userId, query) =>
  userScopedRequest(userId, `/study-history/attempts${studyHistoryQuery(query)}`);
