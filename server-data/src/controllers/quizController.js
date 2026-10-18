import mongoose from "mongoose";
import {
  CONTENT_NAME_MAX,
  CONTEXT_MODES,
  QUIZ_CONCEPT_MAX,
  QUIZ_CONCEPTS_MAX,
  QUIZ_CRITERIA_MAX,
  QUIZ_CRITERIA_MIN,
  QUIZ_CRITERION_MAX,
  QUIZ_DIFFICULTIES,
  QUIZ_EXPECTED_ANSWER_MAX,
  QUIZ_OPTION_MAX,
  QUIZ_PROMPT_MAX,
  QUIZ_QUESTION_TYPES,
  QUIZ_QUESTIONS_MAX,
  QUIZ_QUESTIONS_MIN,
  QUIZ_SNAPSHOT_MAX,
  QUIZ_TOPIC_IDS_MAX,
  QUIZ_TOPIC_PATH_MAX,
} from "../constants/content.js";
import { toQuiz, toQuizSummary } from "../models/quiz.js";
import { toAttemptSummary } from "../models/attempt.js";
import {
  deleteAttemptsForQuiz,
  listAttemptsForQuiz,
  listAttemptsForQuizzes,
} from "../repositories/attemptRepository.js";
import {
  createQuiz,
  deleteQuiz,
  findQuiz,
  listQuizzes,
  updateQuizTitle,
} from "../repositories/quizRepository.js";
import { sendData, sendMessage } from "../utils/responses.js";

const NOT_FOUND = "Quiz not found";
const MANIFEST_STATUSES = ["included", "truncated", "excluded"];
const SOURCE_TYPES = ["subject", "topic", "document"];

function isNonEmptyString(value, max) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
}

function readStringList(value, { maxItems, itemMax, minItems = 0 }) {
  if (!Array.isArray(value) || value.length < minItems || value.length > maxItems) {
    return null;
  }
  const items = [];
  for (const item of value) {
    if (typeof item !== "string" || !item.trim() || item.trim().length > itemMax) {
      return null;
    }
    items.push(item.trim());
  }
  return items;
}

function readQuestion(raw) {
  if (!raw || typeof raw !== "object") {
    return { error: "each question must be an object" };
  }
  if (typeof raw.id !== "string" || !raw.id.trim() || raw.id.trim().length > 80) {
    return { error: "each question needs an id" };
  }
  if (!QUIZ_QUESTION_TYPES.includes(raw.type)) {
    return { error: "question type is invalid" };
  }
  if (!isNonEmptyString(raw.prompt, QUIZ_PROMPT_MAX)) {
    return { error: `prompt must be 1-${QUIZ_PROMPT_MAX} characters` };
  }
  const concepts = readStringList(raw.concepts ?? [], {
    maxItems: QUIZ_CONCEPTS_MAX,
    itemMax: QUIZ_CONCEPT_MAX,
  });
  if (!concepts) {
    return { error: "concepts are invalid" };
  }
  const sourceRefs = readStringList(raw.sourceRefs ?? [], { maxItems: 20, itemMax: 80 });
  if (!sourceRefs) {
    return { error: "sourceRefs are invalid" };
  }
  const question = {
    id: raw.id.trim(),
    type: raw.type,
    prompt: raw.prompt.trim(),
    concepts,
    sourceRefs,
  };
  if (raw.type === "multiple_choice") {
    const options = readStringList(raw.options, { minItems: 4, maxItems: 4, itemMax: QUIZ_OPTION_MAX });
    if (!options || new Set(options).size !== 4) {
      return { error: "multiple-choice questions need four distinct options" };
    }
    if (!Number.isInteger(raw.correctOptionIndex) || raw.correctOptionIndex < 0 || raw.correctOptionIndex > 3) {
      return { error: "correctOptionIndex must be 0-3" };
    }
    question.options = options;
    question.correctOptionIndex = raw.correctOptionIndex;
    return { question };
  }
  if (!isNonEmptyString(raw.expectedAnswer, QUIZ_EXPECTED_ANSWER_MAX)) {
    return { error: `expectedAnswer must be 1-${QUIZ_EXPECTED_ANSWER_MAX} characters` };
  }
  const markingCriteria = readStringList(raw.markingCriteria, {
    minItems: QUIZ_CRITERIA_MIN,
    maxItems: QUIZ_CRITERIA_MAX,
    itemMax: QUIZ_CRITERION_MAX,
  });
  if (!markingCriteria) {
    return { error: "markingCriteria must be 1-5 non-empty strings" };
  }
  question.expectedAnswer = raw.expectedAnswer.trim();
  question.markingCriteria = markingCriteria;
  return { question };
}

function readManifest(raw) {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { error: "sourceManifest is required" };
  }
  const entries = [];
  for (const entry of raw) {
    if (
      !entry ||
      !SOURCE_TYPES.includes(entry.type) ||
      typeof entry.id !== "string" ||
      !entry.id ||
      typeof entry.title !== "string" ||
      typeof entry.path !== "string" ||
      !Number.isInteger(entry.chars) ||
      entry.chars < 0 ||
      !MANIFEST_STATUSES.includes(entry.status)
    ) {
      return { error: "sourceManifest is invalid" };
    }
    entries.push({
      type: entry.type,
      id: entry.id,
      title: entry.title,
      path: entry.path,
      chars: entry.chars,
      status: entry.status,
    });
  }
  return { entries };
}

function readTopicIds(raw, topicId) {
  if (raw === undefined || raw === null) {
    return { topicIds: [] };
  }
  if (!Array.isArray(raw) || raw.length > QUIZ_TOPIC_IDS_MAX) {
    return { error: `topicIds must contain at most ${QUIZ_TOPIC_IDS_MAX} topic ids` };
  }
  const topicIds = [];
  const seen = new Set();
  for (const id of raw) {
    if (typeof id !== "string" || !id.trim()) {
      return { error: "topicIds must be topic ids" };
    }
    const value = id.trim().toLowerCase();
    if (seen.has(value)) {
      return { error: "topicIds must be unique" };
    }
    seen.add(value);
    topicIds.push(value);
  }
  if (topicIds.length > 0 && topicId) {
    return { error: "Send topicId or topicIds, not both" };
  }
  return { topicIds };
}

function limitTopicPath(topicPath) {
  if (topicPath === null || topicPath === undefined || topicPath === "") {
    return null;
  }
  if (typeof topicPath !== "string") {
    return { error: "topicPath must be a string or null" };
  }
  return topicPath.length > QUIZ_TOPIC_PATH_MAX ? topicPath.slice(0, QUIZ_TOPIC_PATH_MAX) : topicPath;
}

function readQuizInput(body) {
  const {
    title,
    subjectId,
    topicId = null,
    topicIds: rawTopicIds,
    subjectName,
    topicPath = null,
    multipleChoiceCount,
    shortAnswerCount,
    difficulty,
    includeDescendants,
    contextMode,
    promptVersion,
    questions,
    sourceManifest,
    sourceSnapshot,
  } = body || {};

  if (!isNonEmptyString(title, CONTENT_NAME_MAX)) {
    return { error: `title must be 1-${CONTENT_NAME_MAX} characters` };
  }
  if (typeof subjectId !== "string" || !subjectId) {
    return { error: "subjectId is required" };
  }
  if (topicId !== null && topicId !== undefined && (typeof topicId !== "string" || !topicId)) {
    return { error: "topicId must be a topic id or null" };
  }
  const parsedTopicIds = readTopicIds(rawTopicIds, topicId || null);
  if (parsedTopicIds.error) {
    return { error: parsedTopicIds.error };
  }
  if (!isNonEmptyString(subjectName, CONTENT_NAME_MAX)) {
    return { error: "subjectName is required" };
  }
  const storedPath = limitTopicPath(topicPath);
  if (storedPath && typeof storedPath === "object") {
    return { error: storedPath.error };
  }
  if (!Number.isInteger(multipleChoiceCount) || multipleChoiceCount < 0) {
    return { error: "multipleChoiceCount is invalid" };
  }
  if (!Number.isInteger(shortAnswerCount) || shortAnswerCount < 0) {
    return { error: "shortAnswerCount is invalid" };
  }
  const total = multipleChoiceCount + shortAnswerCount;
  if (total < QUIZ_QUESTIONS_MIN || total > QUIZ_QUESTIONS_MAX) {
    return { error: `a quiz must have ${QUIZ_QUESTIONS_MIN}-${QUIZ_QUESTIONS_MAX} questions` };
  }
  if (!QUIZ_DIFFICULTIES.includes(difficulty)) {
    return { error: "difficulty is invalid" };
  }
  if (typeof includeDescendants !== "boolean") {
    return { error: "includeDescendants must be true or false" };
  }
  if (!CONTEXT_MODES.includes(contextMode)) {
    return { error: "contextMode is invalid" };
  }
  if (typeof promptVersion !== "string" || !promptVersion || promptVersion.length > 80) {
    return { error: "promptVersion is invalid" };
  }
  if (!Array.isArray(questions) || questions.length !== total) {
    return { error: "questions must match the requested counts" };
  }
  const seenIds = new Set();
  const parsedQuestions = [];
  let mc = 0;
  let sa = 0;
  for (const raw of questions) {
    const { error, question } = readQuestion(raw);
    if (error) {
      return { error };
    }
    if (seenIds.has(question.id)) {
      return { error: "question ids must be unique" };
    }
    seenIds.add(question.id);
    if (question.type === "multiple_choice") mc += 1;
    else sa += 1;
    parsedQuestions.push(question);
  }
  if (mc !== multipleChoiceCount || sa !== shortAnswerCount) {
    return { error: "questions must match the requested counts" };
  }
  const manifest = readManifest(sourceManifest);
  if (manifest.error) {
    return { error: manifest.error };
  }
  if (typeof sourceSnapshot !== "string" || !sourceSnapshot || sourceSnapshot.length > QUIZ_SNAPSHOT_MAX) {
    return { error: "sourceSnapshot is invalid" };
  }

  return {
    values: {
      title: title.trim(),
      subjectId,
      topicId: topicId || null,
      topicIds: parsedTopicIds.topicIds,
      subjectName: subjectName.trim(),
      topicPath: storedPath,
      multipleChoiceCount,
      shortAnswerCount,
      difficulty,
      includeDescendants,
      contextMode,
      promptVersion,
      questions: parsedQuestions,
      sourceManifest: manifest.entries,
      sourceSnapshot,
    },
  };
}

export async function create(req, res, next) {
  try {
    const { error, values } = readQuizInput(req.body);
    if (error) {
      sendMessage(res, 400, error);
      return;
    }
    sendData(res, toQuiz(await createQuiz(req.userId, values)), 201);
  } catch (err) {
    next(err);
  }
}

const QUIZ_SORTS = ["newest", "oldest", "question_count_asc", "question_count_desc"];

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

function readListTopicIds(raw) {
  if (raw === undefined) return { value: [] };
  const values = Array.isArray(raw) ? raw : [raw];
  if (values.length < 1 || values.length > QUIZ_TOPIC_IDS_MAX) {
    return { error: `topicIds must contain 1 to ${QUIZ_TOPIC_IDS_MAX} unique topic ids` };
  }
  const topicIds = [];
  const seen = new Set();
  for (const id of values) {
    if (typeof id !== "string" || !id.trim() || !mongoose.isValidObjectId(id.trim())) {
      return { error: "topicIds must contain valid topic ids" };
    }
    const value = id.trim();
    if (seen.has(value)) return { error: "topicIds must be unique" };
    seen.add(value);
    topicIds.push(value);
  }
  return { value: topicIds };
}

function readListSubjectId(raw) {
  if (raw === undefined) return { value: undefined };
  if (typeof raw !== "string" || !raw.trim() || !mongoose.isValidObjectId(raw.trim())) {
    return { error: "subjectId must be a subject id" };
  }
  return { value: raw.trim() };
}

function readListQuery(query) {
  const page = readQueryInteger(query.page, "page", 1, Number.MAX_SAFE_INTEGER, 1);
  if (page.error) return page;
  const limit = readQueryInteger(query.limit, "limit", 1, 100, 25);
  if (limit.error) return limit;
  const sort = query.sort ?? "newest";
  if (typeof sort !== "string" || !QUIZ_SORTS.includes(sort)) {
    return { error: `sort must be one of ${QUIZ_SORTS.join(", ")}` };
  }
  const subjectId = readListSubjectId(query.subjectId);
  if (subjectId.error) return subjectId;
  const topicIds = readListTopicIds(query.topicIds);
  if (topicIds.error) return topicIds;
  const questionCount = readQueryInteger(
    query.questionCount,
    "questionCount",
    QUIZ_QUESTIONS_MIN,
    QUIZ_QUESTIONS_MAX,
    undefined,
  );
  if (questionCount.error) return questionCount;
  const multipleChoiceCount = readQueryInteger(
    query.multipleChoiceCount,
    "multipleChoiceCount",
    0,
    QUIZ_QUESTIONS_MAX,
    undefined,
  );
  if (multipleChoiceCount.error) return multipleChoiceCount;
  const shortAnswerCount = readQueryInteger(
    query.shortAnswerCount,
    "shortAnswerCount",
    0,
    QUIZ_QUESTIONS_MAX,
    undefined,
  );
  if (shortAnswerCount.error) return shortAnswerCount;

  const total = questionCount.value;
  const mc = multipleChoiceCount.value;
  const sa = shortAnswerCount.value;
  if (
    (total !== undefined && mc !== undefined && mc > total) ||
    (total !== undefined && sa !== undefined && sa > total) ||
    (mc !== undefined &&
      sa !== undefined &&
      (mc + sa < QUIZ_QUESTIONS_MIN ||
        mc + sa > QUIZ_QUESTIONS_MAX ||
        (total !== undefined && mc + sa !== total)))
  ) {
    return { error: "question count filters describe an impossible quiz" };
  }
  return {
    values: {
      page: page.value,
      limit: limit.value,
      sort,
      subjectId: subjectId.value,
      topicIds: topicIds.value,
      questionCount: total,
      multipleChoiceCount: mc,
      shortAnswerCount: sa,
    },
  };
}

function latestResult(attempt) {
  if (!attempt?.evaluation) return null;
  return {
    score: attempt.evaluation.score,
    maxScore: attempt.evaluation.maxScore,
    percent: attempt.evaluation.percent,
  };
}

export async function list(req, res, next) {
  try {
    const { error, values } = readListQuery(req.query);
    if (error) {
      sendMessage(res, 400, error);
      return;
    }
    const { items: quizzes, totalItems } = await listQuizzes(req.userId, values);
    const attempts = await listAttemptsForQuizzes(
      req.userId,
      quizzes.map((quiz) => quiz._id),
    );
    const attemptsByQuiz = new Map();
    for (const attempt of attempts) {
      const quizId = attempt.quizId.toString();
      if (!attemptsByQuiz.has(quizId)) attemptsByQuiz.set(quizId, []);
      attemptsByQuiz.get(quizId).push(attempt);
    }
    const summaries = quizzes.map((quiz) => {
      const quizAttempts = attemptsByQuiz.get(quiz._id.toString()) || [];
      const evaluated = quizAttempts.find((attempt) => attempt.status === "evaluated");
      return toQuizSummary(quiz, {
          attemptCount: quizAttempts.length,
          latestResult: latestResult(evaluated),
        });
    });
    sendData(res, {
      items: summaries,
      pagination: {
        page: values.page,
        limit: values.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / values.limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listAttempts(req, res, next) {
  try {
    const quiz = await findQuiz(req.userId, req.params.quizId);
    if (!quiz) {
      sendMessage(res, 404, NOT_FOUND);
      return;
    }
    const attempts = await listAttemptsForQuiz(req.userId, quiz._id);
    sendData(res, attempts.map((attempt) => toAttemptSummary(attempt)));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const quiz = await deleteQuiz(req.userId, req.params.quizId);
    if (!quiz) {
      sendMessage(res, 404, NOT_FOUND);
      return;
    }
    await deleteAttemptsForQuiz(req.userId, quiz._id);
    sendData(res, { id: quiz._id.toString() });
  } catch (err) {
    next(err);
  }
}

function readStoredTitle(body) {
  const title = body?.title;
  if (typeof title !== "string" || !title.trim() || title.trim().length > CONTENT_NAME_MAX) {
    return { error: `title must be 1-${CONTENT_NAME_MAX} characters` };
  }
  return { title: title.trim() };
}

export async function update(req, res, next) {
  try {
    const parsed = readStoredTitle(req.body);
    if (parsed.error) {
      sendMessage(res, 400, parsed.error);
      return;
    }
    const quiz = await updateQuizTitle(req.userId, req.params.quizId, parsed.title);
    if (!quiz) {
      sendMessage(res, 404, NOT_FOUND);
      return;
    }
    sendData(res, toQuiz(quiz));
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const quiz = await findQuiz(req.userId, req.params.quizId);
    if (!quiz) {
      sendMessage(res, 404, NOT_FOUND);
      return;
    }
    sendData(res, toQuiz(quiz));
  } catch (err) {
    next(err);
  }
}
