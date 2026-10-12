import { createHttpError } from "../utils/httpError.js";
import * as studyHistoryApi from "./dataApi/studyHistory.js";
import * as subjectsApi from "./dataApi/subjects.js";

const RECENT_CHOICES = ["1", "3", "5", "all"];
const ACTIVITY_CHOICES = ["7", "30", "90"];
const RECENT_ALL_CAP = 50;
const WEAKEST_LIMIT = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

function readFilters(query) {
  const { subjectId, topicId, recent, activity } = query || {};
  if (subjectId !== undefined && (typeof subjectId !== "string" || !subjectId.trim())) {
    throw createHttpError(400, "subjectId must be a subject id");
  }
  if (topicId !== undefined && (typeof topicId !== "string" || !topicId.trim())) {
    throw createHttpError(400, "topicId must be a topic id");
  }
  if (topicId !== undefined && subjectId === undefined) {
    throw createHttpError(400, "topicId requires subjectId");
  }
  const recentChoice = recent === undefined ? "5" : String(recent);
  if (!RECENT_CHOICES.includes(recentChoice)) {
    throw createHttpError(400, "recent must be 1, 3, 5, or all");
  }
  const activityChoice = activity === undefined ? "7" : String(activity);
  if (!ACTIVITY_CHOICES.includes(activityChoice)) {
    throw createHttpError(400, "activity must be 7, 30, or 90");
  }
  return {
    subjectId: subjectId?.trim() || null,
    topicId: topicId?.trim() || null,
    recent: recentChoice,
    activityDays: Number(activityChoice),
  };
}

// A topic filter matches the stored topicId or the stored topicIds list.
// A whole-subject quiz (no topic stored) is not part of any topic filter.
function quizInScope(quiz, { subjectId, topicId }) {
  if (subjectId && quiz.subjectId !== subjectId) return false;
  if (topicId) {
    return quiz.topicId === topicId || (quiz.topicIds || []).includes(topicId);
  }
  return true;
}

const submittedMs = (attempt) => Date.parse(attempt.submittedAt);

// Latest evaluated attempt per quiz, used by recentResults and weakestTopics.
function latestAttemptByQuiz(attempts) {
  const latest = new Map();
  for (const attempt of attempts) {
    const current = latest.get(attempt.quizId);
    if (!current || submittedMs(attempt) > submittedMs(current)) {
      latest.set(attempt.quizId, attempt);
    }
  }
  return latest;
}

function toRecentRow(attempt, quiz) {
  return {
    attemptId: attempt.id,
    quizId: attempt.quizId,
    title: quiz.title,
    subjectName: quiz.subjectName,
    topicPath: quiz.topicPath || null,
    submittedAt: attempt.submittedAt,
    score: attempt.score,
    maxScore: attempt.maxScore,
    percent: attempt.percent,
  };
}

const isoDate = (ms) => new Date(ms).toISOString().slice(0, 10);
const utcDayStart = (ms) => Math.floor(ms / DAY_MS) * DAY_MS;

function mondayOf(ms) {
  const dayStart = utcDayStart(ms);
  const weekday = (new Date(dayStart).getUTCDay() + 6) % 7; // Monday = 0
  return dayStart - weekday * DAY_MS;
}

// Evaluated attempts bucketed by submittedAt in UTC. 7 days is daily buckets;
// 30 and 90 days are weekly buckets starting Monday. Empty buckets stay at 0.
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

// Group evaluated quizzes by stored topicId, or by the subject when topicId is null,
// using each quiz's latest evaluated percent. Weakest (lowest average) first.
function buildWeakestTopics(latestByQuiz, quizById) {
  const groups = new Map();
  for (const [quizId, attempt] of latestByQuiz) {
    const quiz = quizById.get(quizId);
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

// Average the stored per-question score across evaluated attempts for the same quiz
// question. Returns prompts and scores only — never answer keys or explanations.
function buildWeakestQuestions(attempts, quizById) {
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
    .map((entry) => {
      const quiz = quizById.get(entry.quizId);
      const question = (quiz.questions || []).find((item) => item.id === entry.questionId);
      return {
        prompt: question?.prompt || "",
        quizId: entry.quizId,
        quizTitle: quiz.title,
        subjectName: quiz.subjectName,
        topicPath: quiz.topicPath || null,
        averageScore: Math.round((entry.totalScore / entry.timesAnswered) * 100) / 100,
        timesAnswered: entry.timesAnswered,
        attemptId: entry.latestAttemptId,
      };
    })
    .sort((a, b) => a.averageScore - b.averageScore || b.timesAnswered - a.timesAnswered)
    .slice(0, WEAKEST_LIMIT);
}

export async function getStudyHistory(userId, query) {
  const filters = readFilters(query);
  if (filters.subjectId) {
    // Unknown or another user's subject is a 404 from the data API.
    await subjectsApi.getSubject(userId, filters.subjectId);
  }
  const source = await studyHistoryApi.getStudyHistorySource(userId);
  const quizzes = (source?.quizzes || []).filter((quiz) => quizInScope(quiz, filters));
  const quizById = new Map(quizzes.map((quiz) => [quiz.id, quiz]));
  const attempts = (source?.attempts || []).filter((attempt) => quizById.has(attempt.quizId));

  const latestByQuiz = latestAttemptByQuiz(attempts);
  const latestRows = [...latestByQuiz.values()].sort((a, b) => submittedMs(b) - submittedMs(a));
  const recentLimit = filters.recent === "all" ? RECENT_ALL_CAP : Number(filters.recent);

  const lastStudiedAt = attempts.reduce(
    (latest, attempt) =>
      latest === null || submittedMs(attempt) > Date.parse(latest) ? attempt.submittedAt : latest,
    null,
  );

  return {
    filter: { subjectId: filters.subjectId, topicId: filters.topicId },
    counts: {
      quizzesSaved: quizzes.length,
      quizzesAttempted: latestByQuiz.size,
      evaluatedAttempts: attempts.length,
    },
    recentResults: latestRows
      .slice(0, recentLimit)
      .map((attempt) => toRecentRow(attempt, quizById.get(attempt.quizId))),
    recentTotal: latestRows.length,
    activity: buildActivity(attempts, filters.activityDays),
    weakestTopics: buildWeakestTopics(latestByQuiz, quizById),
    weakestQuestions: buildWeakestQuestions(attempts, quizById),
    lastStudiedAt,
  };
}
