import mongoose from "mongoose";
import { Quiz } from "../models/quiz.js";

export async function createQuiz(userId, values) {
  return Quiz.create({ ...values, userId });
}

export async function findQuiz(userId, quizId) {
  if (!mongoose.isValidObjectId(quizId)) {
    return null;
  }
  return Quiz.findOne({ _id: quizId, userId });
}

const SUMMARY_FIELDS = "title subjectName topicPath contextMode difficulty multipleChoiceCount shortAnswerCount createdAt";

export async function listQuizzes(userId, limit) {
  const query = Quiz.find({ userId }).sort({ createdAt: -1 }).select(SUMMARY_FIELDS);
  if (limit) query.limit(limit);
  return query;
}

export async function findQuizTitles(userId, quizIds) {
  const quizzes = await Quiz.find({ userId, _id: { $in: quizIds } }).select("title");
  return new Map(quizzes.map((quiz) => [quiz._id.toString(), quiz.title]));
}

export async function deleteQuiz(userId, quizId) {
  if (!mongoose.isValidObjectId(quizId)) return null;
  return Quiz.findOneAndDelete({ _id: quizId, userId });
}
