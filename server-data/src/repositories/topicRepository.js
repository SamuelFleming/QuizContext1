import mongoose from "mongoose";
import { Topic } from "../models/topic.js";
import { deleteDocumentsForTopics } from "./documentRepository.js";

// Every query is scoped to the trusted owner. Callers check subject ownership first.
export async function listTopics(userId, subjectId) {
  return Topic.find({ userId, subjectId }).sort({ createdAt: 1 });
}

export async function createTopic(userId, subjectId, parentTopicId, values) {
  return Topic.create({ ...values, userId, subjectId, parentTopicId: parentTopicId || null });
}

export async function findTopic(userId, topicId) {
  if (!mongoose.isValidObjectId(topicId)) {
    return null;
  }
  return Topic.findOne({ _id: topicId, userId });
}

export async function updateTopic(userId, topicId, values) {
  if (!mongoose.isValidObjectId(topicId)) {
    return null;
  }
  return Topic.findOneAndUpdate({ _id: topicId, userId }, values, {
    new: true,
    runValidators: true,
  });
}

// Ids of a topic and everything beneath it, from the subject's flat topic list.
export async function collectSubtreeIds(userId, topic) {
  const all = await Topic.find({ userId, subjectId: topic.subjectId }, { _id: 1, parentTopicId: 1 });
  const children = new Map();
  for (const t of all) {
    const parent = t.parentTopicId ? t.parentTopicId.toString() : null;
    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push(t._id.toString());
  }
  const ids = [];
  const queue = [topic._id.toString()];
  while (queue.length) {
    const id = queue.shift();
    ids.push(id);
    queue.push(...(children.get(id) || []));
  }
  return ids;
}

// Removes the topics and the documents attached to them.
export async function deleteTopics(userId, topicIds) {
  await Topic.deleteMany({ userId, _id: { $in: topicIds } });
  await deleteDocumentsForTopics(userId, topicIds);
}

export async function deleteTopicsForSubject(userId, subjectId) {
  await Topic.deleteMany({ userId, subjectId });
}
