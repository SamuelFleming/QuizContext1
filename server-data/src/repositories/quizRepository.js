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

export async function listQuizzes(
  userId,
  { page, limit, sort, topicIds, questionCount, multipleChoiceCount, shortAnswerCount },
) {
  const match = { userId: new mongoose.Types.ObjectId(userId) };
  if (topicIds.length) {
    match.$or = [{ topicId: { $in: topicIds } }, { topicIds: { $in: topicIds } }];
  }
  if (multipleChoiceCount !== undefined) match.multipleChoiceCount = multipleChoiceCount;
  if (shortAnswerCount !== undefined) match.shortAnswerCount = shortAnswerCount;
  if (questionCount !== undefined) {
    match.$expr = {
      $eq: [{ $add: ["$multipleChoiceCount", "$shortAnswerCount"] }, questionCount],
    };
  }

  const totalItems = await Quiz.countDocuments(match);
  const sortSpec = {
    newest: { createdAt: -1, _id: -1 },
    oldest: { createdAt: 1, _id: 1 },
    question_count_asc: { questionCount: 1, createdAt: -1, _id: -1 },
    question_count_desc: { questionCount: -1, createdAt: -1, _id: -1 },
  }[sort];
  const fields = SUMMARY_FIELDS.split(" ").reduce((projection, field) => {
    projection[field] = 1;
    return projection;
  }, {});
  const items = await Quiz.aggregate([
    { $match: match },
    { $addFields: { questionCount: { $add: ["$multipleChoiceCount", "$shortAnswerCount"] } } },
    { $sort: sortSpec },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    { $project: fields },
  ]);
  return { items, totalItems };
}

const HISTORY_FIELDS =
  "title subjectId topicId topicIds subjectName topicPath questions.id questions.prompt createdAt";

export async function listQuizzesForHistory(userId) {
  return Quiz.find({ userId }).select(HISTORY_FIELDS);
}

export async function findQuizTitles(userId, quizIds) {
  const quizzes = await Quiz.find({ userId, _id: { $in: quizIds } }).select("title");
  return new Map(quizzes.map((quiz) => [quiz._id.toString(), quiz.title]));
}

export async function deleteQuiz(userId, quizId) {
  if (!mongoose.isValidObjectId(quizId)) return null;
  return Quiz.findOneAndDelete({ _id: quizId, userId });
}
