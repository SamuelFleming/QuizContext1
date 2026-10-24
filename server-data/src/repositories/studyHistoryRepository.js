import mongoose from "mongoose";
import { Attempt } from "../models/attempt.js";
import { Quiz } from "../models/quiz.js";

const WEAKEST_LIMIT = 5;
const DAY_MS = 24 * 60 * 60 * 1000;
const QUIZ_SCOPE_FIELDS = "_id title subjectId topicId subjectName topicPath";
const ATTEMPT_SCORE_FIELDS = "quizId submittedAt evaluation.score evaluation.maxScore evaluation.percent";
const ATTEMPT_PERCENT_FIELDS = "quizId submittedAt evaluation.percent";
const ATTEMPT_QUESTION_FIELDS =
  "quizId submittedAt evaluation.percent evaluation.questions.questionId evaluation.questions.score";

function ownerId(userId) {
  return new mongoose.Types.ObjectId(userId);
}

function idString(value) {
  return value.toString();
}

function submittedMs(attempt) {
  const at = attempt.submittedAt;
  if (at instanceof Date) return at.getTime();
  return Date.parse(at);
}

function isoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function utcDayStart(ms) {
  return Math.floor(ms / DAY_MS) * DAY_MS;
}

function mondayOf(ms) {
  const dayStart = utcDayStart(ms);
  const weekday = (new Date(dayStart).getUTCDay() + 6) % 7;
  return dayStart - weekday * DAY_MS;
}

function mean(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function quizMatch(owner, { subjectId, topicId, quizId }) {
  const match = { userId: owner };
  if (subjectId) match.subjectId = subjectId;
  if (topicId) {
    match.$or = [{ topicId }, { topicIds: topicId }];
  }
  if (quizId) match._id = new mongoose.Types.ObjectId(quizId);
  return match;
}

function attemptMatch(owner, quizIds) {
  return { userId: owner, status: "evaluated", quizId: { $in: quizIds } };
}

function toQuizMap(docs) {
  return new Map(
    docs.map((quiz) => [
      idString(quiz._id),
      {
        id: idString(quiz._id),
        title: quiz.title,
        subjectId: quiz.subjectId,
        topicId: quiz.topicId || null,
        subjectName: quiz.subjectName,
        topicPath: quiz.topicPath || null,
      },
    ]),
  );
}

function toScoredAttempt(doc) {
  const evaluation = doc.evaluation || {};
  return {
    id: idString(doc._id),
    quizId: idString(doc.quizId),
    submittedAt: doc.submittedAt,
    score: evaluation.score ?? null,
    maxScore: evaluation.maxScore ?? null,
    percent: evaluation.percent ?? null,
    questionScores: (evaluation.questions || []).map((item) => ({
      questionId: item.questionId,
      score: item.score,
    })),
  };
}

function toRow(attempt, quiz) {
  return {
    attemptId: attempt.id,
    quizId: attempt.quizId,
    title: quiz?.title || "",
    subjectName: quiz?.subjectName || "",
    topicPath: quiz?.topicPath || null,
    submittedAt: attempt.submittedAt,
    score: attempt.score,
    maxScore: attempt.maxScore,
    percent: attempt.percent,
  };
}

function latestByQuiz(attempts) {
  const latest = new Map();
  for (const attempt of attempts) {
    const current = latest.get(attempt.quizId);
    if (!current || submittedMs(attempt) > submittedMs(current)) {
      latest.set(attempt.quizId, attempt);
    }
  }
  return latest;
}

function newestFirst(attempts) {
  return [...attempts].sort((a, b) => submittedMs(b) - submittedMs(a) || (a.id < b.id ? 1 : -1));
}

function buildStats(quizzes, attempts, { quizId, n }) {
  const latest = latestByQuiz(attempts);
  const percents = attempts.map((attempt) => attempt.percent ?? 0);
  const newest = newestFirst(attempts)[0] || null;
  const lastN = newestFirst(attempts)
    .slice(0, n)
    .map((attempt) => attempt.percent ?? 0);
  const latestPercents = [...latest.values()].map((attempt) => attempt.percent ?? 0);
  const stats = {
    quizzesSaved: quizzes.length,
    quizzesAttempted: latest.size,
    evaluatedAttempts: attempts.length,
    lastStudiedAt: newest?.submittedAt ?? null,
    minPercent: percents.length ? Math.min(...percents) : null,
    maxPercent: percents.length ? Math.max(...percents) : null,
    meanPercent: percents.length ? Math.round(mean(percents)) : null,
    lastPercent: newest?.percent ?? null,
  };
  if (quizId) {
    stats.avgLastNPercent = lastN.length ? Math.round(mean(lastN)) : null;
  } else {
    stats.avgPercent = latestPercents.length ? Math.round(mean(latestPercents)) : null;
  }
  return stats;
}

function buildAttemptSeries(attempts, n) {
  return newestFirst(attempts)
    .slice(0, n)
    .reverse()
    .map((attempt) => attempt.percent ?? 0);
}

function buildActivity(attempts, days) {
  const todayStart = utcDayStart(Date.now());
  const windowStart = todayStart - (days - 1) * DAY_MS;
  const windowEnd = todayStart + DAY_MS;
  const interval = days === 7 ? "day" : "week";
  const buckets = [];
  const indexByStart = new Map();
  if (interval === "day") {
    for (let start = windowStart; start < windowEnd; start += DAY_MS) {
      indexByStart.set(start, buckets.length);
      buckets.push({ start: isoDate(start), count: 0 });
    }
  } else {
    for (let start = mondayOf(windowStart); start <= todayStart; start += 7 * DAY_MS) {
      indexByStart.set(start, buckets.length);
      buckets.push({ start: isoDate(start), count: 0 });
    }
  }
  for (const attempt of attempts) {
    const at = submittedMs(attempt);
    if (!Number.isFinite(at) || at < windowStart || at >= windowEnd) continue;
    const key = interval === "day" ? utcDayStart(at) : mondayOf(at);
    const index = indexByStart.get(key);
    if (index !== undefined) buckets[index].count += 1;
  }
  return { days, interval, buckets };
}

function buildWeakestTopics(attempts, quizById) {
  const groups = new Map();
  for (const [quizId, attempt] of latestByQuiz(attempts)) {
    const quiz = quizById.get(quizId);
    if (!quiz) continue;
    const key = quiz.topicId || `subject:${quiz.subjectId}`;
    let group = groups.get(key);
    if (!group) {
      group = {
        subjectName: quiz.subjectName,
        topicPath: quiz.topicId ? quiz.topicPath : null,
        totalPercent: 0,
        quizCount: 0,
      };
      groups.set(key, group);
    }
    group.totalPercent += attempt.percent ?? 0;
    group.quizCount += 1;
  }
  return [...groups.values()]
    .map((group) => ({
      subjectName: group.subjectName,
      topicPath: group.topicPath || "Whole subject",
      averagePercent: Math.round(group.totalPercent / group.quizCount),
      quizCount: group.quizCount,
    }))
    .sort((a, b) => a.averagePercent - b.averagePercent || b.quizCount - a.quizCount)
    .slice(0, WEAKEST_LIMIT);
}

function rankWeakestQuestions(attempts) {
  const stats = new Map();
  for (const attempt of attempts) {
    const at = submittedMs(attempt);
    for (const item of attempt.questionScores || []) {
      const key = `${attempt.quizId}:${item.questionId}`;
      let entry = stats.get(key);
      if (!entry) {
        entry = {
          quizId: attempt.quizId,
          questionId: item.questionId,
          totalScore: 0,
          timesAnswered: 0,
          latestAttemptId: attempt.id,
          latestAt: at,
        };
        stats.set(key, entry);
      }
      entry.totalScore += item.score ?? 0;
      entry.timesAnswered += 1;
      if (at > entry.latestAt) {
        entry.latestAt = at;
        entry.latestAttemptId = attempt.id;
      }
    }
  }
  return [...stats.values()]
    .map((entry) => ({
      quizId: entry.quizId,
      questionId: entry.questionId,
      averageScore: Math.round((entry.totalScore / entry.timesAnswered) * 100) / 100,
      timesAnswered: entry.timesAnswered,
      attemptId: entry.latestAttemptId,
    }))
    .sort((a, b) => a.averageScore - b.averageScore || b.timesAnswered - a.timesAnswered)
    .slice(0, WEAKEST_LIMIT);
}

async function loadQuestionPrompts(owner, ranked, quizById) {
  const quizIds = [...new Set(ranked.map((entry) => entry.quizId))].map(
    (id) => new mongoose.Types.ObjectId(id),
  );
  const docs = quizIds.length
    ? await Quiz.find({ userId: owner, _id: { $in: quizIds } })
        .select("questions.id questions.prompt")
        .lean()
    : [];
  const prompts = new Map();
  for (const quiz of docs) {
    for (const question of quiz.questions || []) {
      prompts.set(`${idString(quiz._id)}:${question.id}`, question.prompt || "");
    }
  }
  return ranked.map((entry) => {
    const quiz = quizById.get(entry.quizId);
    return {
      prompt: prompts.get(`${entry.quizId}:${entry.questionId}`) || "",
      quizId: entry.quizId,
      quizTitle: quiz?.title || "",
      subjectName: quiz?.subjectName || "",
      topicPath: quiz?.topicPath || null,
      averageScore: entry.averageScore,
      timesAnswered: entry.timesAnswered,
      attemptId: entry.attemptId,
    };
  });
}

async function pageLatestResults(owner, quizIds, { page, limit }) {
  const match = attemptMatch(owner, quizIds);
  const [countRows, rows] = await Promise.all([
    Attempt.aggregate([{ $match: match }, { $group: { _id: "$quizId" } }, { $count: "total" }]),
    Attempt.aggregate([
      { $match: match },
      { $sort: { submittedAt: -1, _id: -1 } },
      { $group: { _id: "$quizId", latest: { $first: "$$ROOT" } } },
      { $sort: { "latest.submittedAt": -1, "latest._id": -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]),
  ]);
  return {
    totalItems: countRows[0]?.total || 0,
    items: rows.map((row) => toScoredAttempt(row.latest)),
  };
}

async function pageAttempts(owner, quizIds, { page, limit }) {
  const match = attemptMatch(owner, quizIds);
  const [totalItems, docs] = await Promise.all([
    Attempt.countDocuments(match),
    Attempt.find(match)
      .sort({ submittedAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(ATTEMPT_SCORE_FIELDS)
      .lean(),
  ]);
  return { totalItems, items: docs.map(toScoredAttempt) };
}

async function listScoredAttempts(owner, quizIds, { withQuestionScores }) {
  return (
    await Attempt.find(attemptMatch(owner, quizIds))
      .select(withQuestionScores ? ATTEMPT_QUESTION_FIELDS : ATTEMPT_PERCENT_FIELDS)
      .lean()
  ).map(toScoredAttempt);
}

function emptyResult({ subjectId, topicId, quizId, page, limit, include, n, activityDays }) {
  const result = {
    filter: { subjectId: subjectId ?? null, topicId: topicId ?? null, quizId: quizId ?? null },
    items: [],
    pagination: { page, limit, totalItems: 0, totalPages: 0 },
  };
  if (include.stats) {
    result.stats = buildStats([], [], { quizId, n });
  }
  if (include.attemptSeries) result.attemptSeries = [];
  if (include.weakestQuestions) result.weakestQuestions = [];
  if (include.weakestTopics) result.weakestTopics = [];
  if (include.activity) result.activity = buildActivity([], activityDays);
  return result;
}

export async function readStudyHistory(
  userId,
  { subjectId, topicId, quizId, page, limit, n, include, activityDays, pageMode },
) {
  const owner = ownerId(userId);
  const quizDocs = await Quiz.find(quizMatch(owner, { subjectId, topicId, quizId }))
    .select(QUIZ_SCOPE_FIELDS)
    .lean();
  const quizById = toQuizMap(quizDocs);
  const quizIds = quizDocs.map((quiz) => quiz._id);
  if (!quizIds.length) {
    return emptyResult({ subjectId, topicId, quizId, page, limit, include, n, activityDays });
  }

  const needScored =
    include.stats || include.attemptSeries || include.activity || include.weakestTopics || include.weakestQuestions;
  const [pageResult, scoredAttempts] = await Promise.all([
    pageMode === "attempts"
      ? pageAttempts(owner, quizIds, { page, limit })
      : pageLatestResults(owner, quizIds, { page, limit }),
    needScored
      ? listScoredAttempts(owner, quizIds, { withQuestionScores: include.weakestQuestions })
      : Promise.resolve([]),
  ]);

  const result = {
    filter: { subjectId: subjectId ?? null, topicId: topicId ?? null, quizId: quizId ?? null },
    items: pageResult.items.map((attempt) => toRow(attempt, quizById.get(attempt.quizId))),
    pagination: {
      page,
      limit,
      totalItems: pageResult.totalItems,
      totalPages: pageResult.totalItems === 0 ? 0 : Math.ceil(pageResult.totalItems / limit),
    },
  };

  if (include.stats) {
    result.stats = buildStats(quizDocs, scoredAttempts, { quizId, n });
  }
  if (include.attemptSeries) {
    result.attemptSeries = buildAttemptSeries(scoredAttempts, n);
  }
  if (include.weakestTopics) {
    result.weakestTopics = buildWeakestTopics(scoredAttempts, quizById);
  }
  if (include.weakestQuestions) {
    result.weakestQuestions = await loadQuestionPrompts(
      owner,
      rankWeakestQuestions(scoredAttempts),
      quizById,
    );
  }
  if (include.activity) {
    result.activity = buildActivity(scoredAttempts, activityDays);
  }
  return result;
}
