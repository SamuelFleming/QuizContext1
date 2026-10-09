import mongoose from "mongoose";
import { Subject } from "../models/subject.js";
import { deleteDocumentsForSubject } from "./documentRepository.js";
import { deleteTopicsForSubject } from "./topicRepository.js";

// Every query is scoped to the trusted owner. A subject owned by someone else behaves
// exactly like a missing one.
export async function listSubjects(userId) {
  return Subject.find({ userId }).sort({ updatedAt: -1 });
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
