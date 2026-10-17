import mongoose from "mongoose";
import { toTopic } from "../models/topic.js";
import { findSubject } from "../repositories/subjectRepository.js";
import {
  collectSubtreeIds,
  createTopic,
  deleteTopics,
  findTopic,
  listTopics,
  topicDocumentCounts,
  updateTopic,
} from "../repositories/topicRepository.js";
import { readContentFields } from "../utils/contentFields.js";
import { sendData, sendMessage } from "../utils/responses.js";

const NOT_FOUND = "Topic not found";

export async function listForSubject(req, res, next) {
  try {
    const subject = await findSubject(req.userId, req.params.subjectId);
    if (!subject) {
      sendMessage(res, 404, "Subject not found");
      return;
    }
    const topics = await listTopics(req.userId, subject._id);
    const counts = await topicDocumentCounts(req.userId, subject._id);
    sendData(res, topics.map((topic) => toTopic(topic, counts.get(topic._id.toString()) || 0)));
  } catch (err) {
    next(err);
  }
}

// The subject and any parent must belong to X-User-Id, and the parent must sit in the
// same subject. A parent the caller does not own is reported as missing.
export async function createForSubject(req, res, next) {
  try {
    const { error, values } = readContentFields(req.body, { requireName: true });
    if (error) {
      sendMessage(res, 400, error);
      return;
    }
    const subject = await findSubject(req.userId, req.params.subjectId);
    if (!subject) {
      sendMessage(res, 404, "Subject not found");
      return;
    }
    const parentTopicId = req.body?.parentTopicId ?? null;
    if (parentTopicId !== null) {
      if (typeof parentTopicId !== "string" || !mongoose.isValidObjectId(parentTopicId)) {
        sendMessage(res, 400, "parentTopicId must be a topic id or null");
        return;
      }
      const parent = await findTopic(req.userId, parentTopicId);
      if (!parent) {
        sendMessage(res, 404, "Parent topic not found");
        return;
      }
      if (!parent.subjectId.equals(subject._id)) {
        sendMessage(res, 400, "Parent topic belongs to a different subject");
        return;
      }
    }
    const topic = await createTopic(req.userId, subject._id, parentTopicId, values);
    const counts = await topicDocumentCounts(req.userId, subject._id);
    sendData(res, toTopic(topic, counts.get(topic._id.toString()) || 0), 201);
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const topic = await findTopic(req.userId, req.params.topicId);
    if (!topic) {
      sendMessage(res, 404, NOT_FOUND);
      return;
    }
    const counts = await topicDocumentCounts(req.userId, topic.subjectId);
    sendData(res, toTopic(topic, counts.get(topic._id.toString()) || 0));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { error, values } = readContentFields(req.body, { requireName: false });
    if (error) {
      sendMessage(res, 400, error);
      return;
    }
    const topic = await updateTopic(req.userId, req.params.topicId, values);
    if (!topic) {
      sendMessage(res, 404, NOT_FOUND);
      return;
    }
    const counts = await topicDocumentCounts(req.userId, topic.subjectId);
    sendData(res, toTopic(topic, counts.get(topic._id.toString()) || 0));
  } catch (err) {
    next(err);
  }
}

// Deletes the topic and all of its descendants.
export async function remove(req, res, next) {
  try {
    const topic = await findTopic(req.userId, req.params.topicId);
    if (!topic) {
      sendMessage(res, 404, NOT_FOUND);
      return;
    }
    const ids = await collectSubtreeIds(req.userId, topic);
    await deleteTopics(req.userId, ids);
    sendData(res, { id: topic._id.toString(), deletedTopicIds: ids });
  } catch (err) {
    next(err);
  }
}
