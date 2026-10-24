import { createHttpError } from "../utils/httpError.js";
import * as studyHistoryApi from "./dataApi/studyHistory.js";
import * as subjectsApi from "./dataApi/subjects.js";

const RECENT_CHOICES = ["1", "3", "5", "all"];
const ACTIVITY_CHOICES = ["7", "30", "90"];
const RECENT_ALL_CAP = 50;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 100;
const DASHBOARD_INCLUDES = ["stats", "activity", "weakestQuestions", "weakestTopics"];

function readQueryInteger(raw, name, min, max, fallback) {
  if (raw === undefined) return fallback;
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) {
    throw createHttpError(400, `${name} must be an integer from ${min} to ${max}`);
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw createHttpError(400, `${name} must be an integer from ${min} to ${max}`);
  }
  return value;
}

function readFilters(query) {
  const { subjectId, topicId, recent, activity, page, limit } = query || {};
  if (subjectId !== undefined && (typeof subjectId !== "string" || !subjectId.trim())) {
    throw createHttpError(400, "subjectId must be a subject id");
  }
  if (topicId !== undefined && (typeof topicId !== "string" || !topicId.trim())) {
    throw createHttpError(400, "topicId must be a topic id");
  }
  if (topicId !== undefined && subjectId === undefined) {
    throw createHttpError(400, "topicId requires subjectId");
  }
  if (recent !== undefined) {
    const recentChoice = String(recent);
    if (!RECENT_CHOICES.includes(recentChoice)) {
      throw createHttpError(400, "recent must be 1, 3, 5, or all");
    }
  }
  const activityChoice = activity === undefined ? "7" : String(activity);
  if (!ACTIVITY_CHOICES.includes(activityChoice)) {
    throw createHttpError(400, "activity must be 7, 30, or 90");
  }

  const resolvedPage = readQueryInteger(page, "page", 1, Number.MAX_SAFE_INTEGER, 1);
  let resolvedLimit;
  if (limit !== undefined) {
    resolvedLimit = readQueryInteger(limit, "limit", 1, MAX_LIMIT, DEFAULT_LIMIT);
  } else if (recent !== undefined) {
    resolvedLimit = String(recent) === "all" ? RECENT_ALL_CAP : Number(recent);
  } else {
    resolvedLimit = DEFAULT_LIMIT;
  }

  return {
    subjectId: subjectId?.trim() || null,
    topicId: topicId?.trim() || null,
    page: resolvedPage,
    limit: resolvedLimit,
    activityDays: Number(activityChoice),
  };
}

function toPublicSummary(filters, source) {
  const pagination = source?.pagination || {
    page: filters.page,
    limit: filters.limit,
    totalItems: 0,
    totalPages: 0,
  };
  const stats = source?.stats || {};
  return {
    filter: { subjectId: filters.subjectId, topicId: filters.topicId },
    counts: {
      quizzesSaved: stats.quizzesSaved ?? 0,
      quizzesAttempted: stats.quizzesAttempted ?? 0,
      evaluatedAttempts: stats.evaluatedAttempts ?? 0,
    },
    recentResults: source?.items || [],
    recentTotal: pagination.totalItems,
    activity: source?.activity,
    weakestTopics: source?.weakestTopics || [],
    weakestQuestions: source?.weakestQuestions || [],
    lastStudiedAt: stats.lastStudiedAt ?? null,
    pagination,
  };
}

export async function getStudyHistory(userId, query) {
  const filters = readFilters(query);
  if (filters.subjectId) {
    await subjectsApi.getSubject(userId, filters.subjectId);
  }

  const source = await studyHistoryApi.getStudyHistoryResults(userId, {
    subjectId: filters.subjectId || undefined,
    topicId: filters.topicId || undefined,
    page: filters.page,
    limit: filters.limit,
    activity: filters.activityDays,
    include: DASHBOARD_INCLUDES,
  });

  return toPublicSummary(filters, source);
}
