import { request } from "./apiClient.js";

export const suggestDescription = ({ subjectId, topicId = null, includeDescendants = true }) =>
  request("/ai/description-suggestions", {
    method: "POST",
    body: { subjectId, topicId, includeDescendants },
    auth: true,
  });
