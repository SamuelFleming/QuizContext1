import mongoose from "mongoose";
import { Attempt } from "../models/attempt.js";

export async function findInProgressAttempt(userId, quizId) {
  if (!mongoose.isValidObjectId(quizId)) return null;
  return Attempt.findOne({ userId, quizId, status: "in_progress" });
}

export async function createAttempt(userId, quizId) {
  return Attempt.create({
    userId,
    quizId,
    status: "in_progress",
    responses: [],
    startedAt: new Date(),
    submittedAt: null,
    evaluation: null,
  });
}

export async function listAttemptsForQuiz(userId, quizId) {
  if (!mongoose.isValidObjectId(quizId)) return [];
  return Attempt.find({ userId, quizId }).sort({ createdAt: -1 }).select("quizId status startedAt submittedAt evaluation createdAt");
}

export async function listAttemptsForQuizzes(userId, quizIds) {
  if (!Array.isArray(quizIds) || quizIds.length === 0) return [];
  return Attempt.find({ userId, quizId: { $in: quizIds } })
    .sort({ createdAt: -1 })
    .select("quizId status evaluation createdAt");
}

export async function listRecentAttempts(userId, limit) {
  const query = Attempt.find({ userId }).sort({ createdAt: -1 }).select("quizId status startedAt submittedAt evaluation createdAt");
  if (limit) query.limit(limit);
  return query;
}

export async function deleteAttemptsForQuiz(userId, quizId) {
  if (!mongoose.isValidObjectId(quizId)) return;
  await Attempt.deleteMany({ userId, quizId });
}

export async function findAttempt(userId, attemptId) {
  if (!mongoose.isValidObjectId(attemptId)) return null;
  return Attempt.findOne({ _id: attemptId, userId });
}

export async function saveAttemptResponses(userId, attemptId, responses) {
  if (!mongoose.isValidObjectId(attemptId)) return null;
  return Attempt.findOneAndUpdate(
    { _id: attemptId, userId, status: "in_progress" },
    { responses },
    { new: true, runValidators: true },
  );
}

const OPENABLE = ["submitted", "evaluation_failed"];

export async function saveAttemptEvaluation(userId, attemptId, { status, evaluation }) {
  if (!mongoose.isValidObjectId(attemptId)) return null;
  return Attempt.findOneAndUpdate(
    { _id: attemptId, userId, status: { $in: OPENABLE } },
    { status, evaluation },
    { new: true, runValidators: true },
  );
}

export async function submitAttempt(userId, attemptId, responses, submittedAt) {
  if (!mongoose.isValidObjectId(attemptId)) return null;
  return Attempt.findOneAndUpdate(
    { _id: attemptId, userId, status: "in_progress" },
    { responses, status: "submitted", submittedAt },
    { new: true, runValidators: true },
  );
}
