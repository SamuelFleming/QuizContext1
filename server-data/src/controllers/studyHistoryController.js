import mongoose from "mongoose";
import { readStudyHistory } from "../repositories/studyHistoryRepository.js";
import { sendData, sendMessage } from "../utils/responses.js";

const INCLUDE_FLAGS = ["stats", "weakestQuestions", "weakestTopics", "attemptSeries", "activity"];
const ACTIVITY_DAYS = [7, 30, 90];

function readQueryInteger(raw, name, min, max, fallback) {
  if (raw === undefined) return { value: fallback };
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) {
    return { error: `${name} must be an integer from ${min} to ${max}` };
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    return { error: `${name} must be an integer from ${min} to ${max}` };
  }
  return { value };
}

function readOptionalId(raw, name) {
  if (raw === undefined) return { value: undefined };
  if (typeof raw !== "string" || !raw.trim() || !mongoose.isValidObjectId(raw.trim())) {
    return { error: `${name} must be a ${name.replace(/Id$/, "")} id` };
  }
  return { value: raw.trim() };
}

function readInclude(raw) {
  if (raw === undefined) return { value: {} };
  const parts = (Array.isArray(raw) ? raw : [raw])
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  const include = {};
  for (const flag of parts) {
    if (!INCLUDE_FLAGS.includes(flag)) {
      return { error: `include must be one or more of ${INCLUDE_FLAGS.join(", ")}` };
    }
    include[flag] = true;
  }
  return { value: include };
}

function readActivityDays(raw, include) {
  if (!include.activity) return { value: 7 };
  if (raw === undefined) return { value: 7 };
  const value = Number(raw);
  if (!ACTIVITY_DAYS.includes(value)) {
    return { error: "activity must be 7, 30, or 90" };
  }
  return { value };
}

function readQuery(query) {
  const page = readQueryInteger(query.page, "page", 1, Number.MAX_SAFE_INTEGER, 1);
  if (page.error) return page;
  const limit = readQueryInteger(query.limit, "limit", 1, 100, 25);
  if (limit.error) return limit;
  const n = readQueryInteger(query.n, "n", 1, 100, 10);
  if (n.error) return n;
  const subjectId = readOptionalId(query.subjectId, "subjectId");
  if (subjectId.error) return subjectId;
  const topicId = readOptionalId(query.topicId, "topicId");
  if (topicId.error) return topicId;
  const quizId = readOptionalId(query.quizId, "quizId");
  if (quizId.error) return quizId;
  const include = readInclude(query.include);
  if (include.error) return include;
  const activityDays = readActivityDays(query.activity, include.value);
  if (activityDays.error) return activityDays;
  return {
    values: {
      page: page.value,
      limit: limit.value,
      n: n.value,
      subjectId: subjectId.value,
      topicId: topicId.value,
      quizId: quizId.value,
      include: include.value,
      activityDays: activityDays.value,
    },
  };
}

async function read(req, res, next, pageMode) {
  try {
    const parsed = readQuery(req.query);
    if (parsed.error) {
      sendMessage(res, 400, parsed.error);
      return;
    }
    sendData(res, await readStudyHistory(req.userId, { ...parsed.values, pageMode }));
  } catch (err) {
    next(err);
  }
}

export function readResults(req, res, next) {
  return read(req, res, next, "results");
}

export function readAttempts(req, res, next) {
  return read(req, res, next, "attempts");
}
