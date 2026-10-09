import { createHttpError } from "../utils/httpError.js";
import { pickContentFields } from "../utils/contentFields.js";
import * as topicsApi from "./dataApi/topics.js";

// server-data checks that the subject and parent belong to the token user.
export const listTopics = (userId, subjectId) => topicsApi.listTopics(userId, subjectId);

export function createTopic(userId, subjectId, body) {
  const values = pickContentFields(body, { requireName: true });
  const parentTopicId = body?.parentTopicId ?? null;
  if (parentTopicId !== null && typeof parentTopicId !== "string") {
    throw createHttpError(400, "parentTopicId must be a topic id or null");
  }
  return topicsApi.createTopic(userId, subjectId, { ...values, parentTopicId });
}

export const getTopic = (userId, topicId) => topicsApi.getTopic(userId, topicId);

export function updateTopic(userId, topicId, body) {
  return topicsApi.updateTopic(userId, topicId, pickContentFields(body, { requireName: false }));
}

export const deleteTopic = (userId, topicId) => topicsApi.deleteTopic(userId, topicId);
