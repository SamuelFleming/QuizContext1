import mongoose from "mongoose";
import { toDocument } from "../models/document.js";
import { toSubject } from "../models/subject.js";
import { toTopic } from "../models/topic.js";
import { listDocumentsWithContent } from "../repositories/documentRepository.js";
import { findSubject } from "../repositories/subjectRepository.js";
import { collectSubtreeIds, findTopic, listTopics } from "../repositories/topicRepository.js";
import { sendData, sendMessage } from "../utils/responses.js";

function ancestorsOf(topic, allTopics) {
  const byId = new Map(allTopics.map((t) => [t._id.toString(), t]));
  const chain = [];
  let parentId = topic.parentTopicId ? topic.parentTopicId.toString() : null;
  while (parentId && byId.has(parentId) && chain.length < allTopics.length) {
    const parent = byId.get(parentId);
    chain.unshift({ id: parentId, name: parent.name });
    parentId = parent.parentTopicId ? parent.parentTopicId.toString() : null;
  }
  return chain;
}

// Raw, owner-scoped source material for one selection. Ordering, labelling, and budgeting
// happen in server-webApp. No topicId means the whole subject.
export async function getSources(req, res, next) {
  try {
    const subject = await findSubject(req.userId, req.params.subjectId);
    if (!subject) {
      sendMessage(res, 404, "Subject not found");
      return;
    }
    const { topicId, includeDescendants = "true" } = req.query;
    if (includeDescendants !== "true" && includeDescendants !== "false") {
      sendMessage(res, 400, "includeDescendants must be true or false");
      return;
    }

    const allTopics = await listTopics(req.userId, subject._id);
    if (topicId === undefined) {
      const documents = await listDocumentsWithContent(req.userId, subject._id, null);
      sendData(res, {
        subject: toSubject(subject),
        topicId: null,
        ancestors: [],
        topics: allTopics.map(toTopic),
        documents: documents.map(toDocument),
      });
      return;
    }

    if (typeof topicId !== "string" || !mongoose.isValidObjectId(topicId)) {
      sendMessage(res, 400, "topicId must be a topic id");
      return;
    }
    const topic = await findTopic(req.userId, topicId);
    if (!topic || !topic.subjectId.equals(subject._id)) {
      sendMessage(res, 404, "Topic not found");
      return;
    }
    const ids =
      includeDescendants === "true" ? await collectSubtreeIds(req.userId, topic) : [topic._id.toString()];
    const inScope = new Set(ids);
    const documents = await listDocumentsWithContent(req.userId, subject._id, ids);
    sendData(res, {
      subject: toSubject(subject),
      topicId: topic._id.toString(),
      ancestors: ancestorsOf(topic, allTopics),
      topics: allTopics.filter((t) => inScope.has(t._id.toString())).map(toTopic),
      documents: documents.map(toDocument),
    });
  } catch (err) {
    next(err);
  }
}
