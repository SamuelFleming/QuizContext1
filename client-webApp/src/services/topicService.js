import { request } from "./apiClient.js";

const subjectTopicsPath = (subjectId) => `/subjects/${encodeURIComponent(subjectId)}/topics`;
const topicPath = (topicId) => `/topics/${encodeURIComponent(topicId)}`;

export const listTopics = (subjectId) => request(subjectTopicsPath(subjectId), { auth: true });
export const createTopic = (subjectId, payload) =>
  request(subjectTopicsPath(subjectId), { method: "POST", body: payload, auth: true });
export const updateTopic = (topicId, payload) =>
  request(topicPath(topicId), { method: "PATCH", body: payload, auth: true });
export const deleteTopic = (topicId) => request(topicPath(topicId), { method: "DELETE", auth: true });
