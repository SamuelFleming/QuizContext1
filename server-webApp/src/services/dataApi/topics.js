import { userScopedRequest } from "./client.js";

const subjectTopicsPath = (subjectId) => `/subjects/${encodeURIComponent(subjectId)}/topics`;
const topicPath = (topicId) => `/topics/${encodeURIComponent(topicId)}`;

export const listTopics = (userId, subjectId) =>
  userScopedRequest(userId, subjectTopicsPath(subjectId));

export const createTopic = (userId, subjectId, body) =>
  userScopedRequest(userId, subjectTopicsPath(subjectId), { method: "POST", body });

export const getTopic = (userId, topicId) => userScopedRequest(userId, topicPath(topicId));

export const updateTopic = (userId, topicId, values) =>
  userScopedRequest(userId, topicPath(topicId), { method: "PATCH", body: values });

export const deleteTopic = (userId, topicId) =>
  userScopedRequest(userId, topicPath(topicId), { method: "DELETE" });
