import { request } from "./apiClient.js";

export const listAiModels = () => request("/ai/models", { auth: true });

export const suggestDescription = ({ subjectId, topicId = null, includeDescendants = true }) =>
  request("/ai/description-suggestions", {
    method: "POST",
    body: { subjectId, topicId, includeDescendants },
    auth: true,
  });
