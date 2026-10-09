import { userScopedRequest } from "./client.js";

export function getContextSources(userId, subjectId, { topicId, includeDescendants }) {
  const params = new URLSearchParams({ includeDescendants: String(includeDescendants) });
  if (topicId) {
    params.set("topicId", topicId);
  }
  return userScopedRequest(
    userId,
    `/subjects/${encodeURIComponent(subjectId)}/context-sources?${params}`,
  );
}
