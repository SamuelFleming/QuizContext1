import mongoose from "mongoose";
import { Subject } from "../models/subject.js";
import { hasText } from "../utils/completeness.js";
import { countDocumentsByOwner, deleteDocumentsForSubject } from "./documentRepository.js";
import { deleteTopicsForSubject, listTopicNotes } from "./topicRepository.js";

// Every query is scoped to the trusted owner. A subject owned by someone else behaves
// exactly like a missing one.
export async function listSubjects(userId) {
  return Subject.find({ userId }).sort({ updatedAt: -1 });
}

// Computed on read. documentCount is subject-level documents only (topicId null).
export async function subjectContentStats(userId, subjects) {
  const stats = new Map();
  if (!subjects.length) return stats;
  const subjectIds = subjects.map((subject) => subject._id);
  const [topics, groups] = await Promise.all([
    listTopicNotes(userId, subjectIds),
    countDocumentsByOwner(userId, subjectIds),
  ]);

  const topicDocCount = new Map();
  const subjectDocCount = new Map();
  for (const row of groups) {
    const subjectId = row._id.subjectId.toString();
    if (row._id.topicId) {
      topicDocCount.set(row._id.topicId.toString(), row.count);
    } else {
      subjectDocCount.set(subjectId, (subjectDocCount.get(subjectId) || 0) + row.count);
    }
  }

  const topicsBySubject = new Map();
  for (const topic of topics) {
    const subjectId = topic.subjectId.toString();
    if (!topicsBySubject.has(subjectId)) topicsBySubject.set(subjectId, []);
    topicsBySubject.get(subjectId).push(topic);
  }

  for (const subject of subjects) {
    const subjectId = subject._id.toString();
    const ownTopics = topicsBySubject.get(subjectId) || [];
    let contentCompleteTopicCount = 0;
    for (const topic of ownTopics) {
      if (hasText(topic.notes) || (topicDocCount.get(topic._id.toString()) || 0) > 0) {
        contentCompleteTopicCount += 1;
      }
    }
    stats.set(subjectId, {
      documentCount: subjectDocCount.get(subjectId) || 0,
      topicCount: ownTopics.length,
      contentCompleteTopicCount,
    });
  }
  return stats;
}

export async function createSubject(userId, values) {
  return Subject.create({ ...values, userId });
}

export async function findSubject(userId, subjectId) {
  if (!mongoose.isValidObjectId(subjectId)) {
    return null;
  }
  return Subject.findOne({ _id: subjectId, userId });
}

export async function updateSubject(userId, subjectId, values) {
  if (!mongoose.isValidObjectId(subjectId)) {
    return null;
  }
  return Subject.findOneAndUpdate({ _id: subjectId, userId }, values, {
    new: true,
    runValidators: true,
  });
}

// Hard delete. The subject's topics and documents go with it.
export async function deleteSubject(userId, subjectId) {
  if (!mongoose.isValidObjectId(subjectId)) {
    return null;
  }
  const subject = await Subject.findOneAndDelete({ _id: subjectId, userId });
  if (subject) {
    await deleteTopicsForSubject(userId, subject._id);
    await deleteDocumentsForSubject(userId, subject._id);
  }
  return subject;
}
