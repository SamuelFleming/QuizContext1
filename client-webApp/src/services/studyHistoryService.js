import { request } from "./apiClient.js";

export const getStudyHistory = ({ subjectId, topicId, recent, activity, page } = {}) => {
  const params = new URLSearchParams();
  if (subjectId) params.set("subjectId", subjectId);
  if (topicId) params.set("topicId", topicId);
  if (recent) params.set("recent", recent);
  if (activity) params.set("activity", activity);
  if (page) params.set("page", String(page));

  const query = params.toString();
  return request(`/study-history${query ? `?${query}` : ""}`, { auth: true });
};
