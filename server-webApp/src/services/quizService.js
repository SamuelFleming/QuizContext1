import { randomUUID } from "node:crypto";
import { getAiConfig } from "../config/aiConfig.js";
import { CONTEXT_MODES, DEFAULT_CONTEXT_MODE } from "../constants/contextModes.js";
import {
  CONTENT_NAME_MAX,
  QUIZ_DIFFICULTIES,
  QUIZ_QUESTIONS_MAX,
  QUIZ_QUESTIONS_MIN,
  QUIZ_TOPIC_IDS_MAX,
  QUIZ_TOPIC_PATH_MAX,
} from "../constants/validation.js";
import { runAiOperation } from "../openai/aiService.js";
import * as prompt from "../openai/prompts/quizGeneration.js";
import { createHttpError } from "../utils/httpError.js";
import { assembleContext } from "./contextService.js";
import * as quizzesApi from "./dataApi/quizzes.js";
import * as topicsApi from "./dataApi/topics.js";
import { toStudyView } from "./quizStudyView.js";

function countStatus(manifest, status) {
  return manifest.filter((entry) => entry.status === status).length;
}

function sourceCounts(manifest, type) {
  const entries = manifest.filter((entry) => entry.type === type);
  return {
    included: countStatus(entries, "included"),
    truncated: countStatus(entries, "truncated"),
    excluded: countStatus(entries, "excluded"),
  };
}

function readCount(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw createHttpError(400, `${name} must be a non-negative integer`);
  }
  return value;
}

const QUIZ_SORTS = ["newest", "oldest", "question_count_asc", "question_count_desc"];

function readOptionalTitle(raw) {
  if (raw === undefined || raw === null) return null;
  if (typeof raw !== "string") {
    throw createHttpError(400, "title must be a string");
  }
  const title = raw.trim();
  if (!title) return null;
  if (title.length > CONTENT_NAME_MAX) {
    throw createHttpError(400, `title must be at most ${CONTENT_NAME_MAX} characters`);
  }
  return title;
}

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

function readListTopicIds(raw) {
  if (raw === undefined) return [];
  const values = Array.isArray(raw) ? raw : [raw];
  if (values.length < 1 || values.length > QUIZ_TOPIC_IDS_MAX) {
    throw createHttpError(400, `topicIds must contain 1 to ${QUIZ_TOPIC_IDS_MAX} unique topic ids`);
  }
  const topicIds = [];
  const seen = new Set();
  for (const id of values) {
    if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id.trim())) {
      throw createHttpError(400, "topicIds must contain valid topic ids");
    }
    const value = id.trim().toLowerCase();
    if (seen.has(value)) throw createHttpError(400, "topicIds must be unique");
    seen.add(value);
    topicIds.push(value);
  }
  return topicIds;
}

function readListQuery(query = {}) {
  const page = readQueryInteger(query.page, "page", 1, Number.MAX_SAFE_INTEGER, 1);
  const limit = readQueryInteger(query.limit, "limit", 1, 25, 25);
  const sort = query.sort ?? "newest";
  if (typeof sort !== "string" || !QUIZ_SORTS.includes(sort)) {
    throw createHttpError(400, `sort must be one of ${QUIZ_SORTS.join(", ")}`);
  }
  const topicIds = readListTopicIds(query.topicIds);
  const questionCount = readQueryInteger(
    query.questionCount,
    "questionCount",
    QUIZ_QUESTIONS_MIN,
    QUIZ_QUESTIONS_MAX,
    undefined,
  );
  const multipleChoiceCount = readQueryInteger(
    query.multipleChoiceCount,
    "multipleChoiceCount",
    0,
    QUIZ_QUESTIONS_MAX,
    undefined,
  );
  const shortAnswerCount = readQueryInteger(
    query.shortAnswerCount,
    "shortAnswerCount",
    0,
    QUIZ_QUESTIONS_MAX,
    undefined,
  );
  if (
    (questionCount !== undefined &&
      multipleChoiceCount !== undefined &&
      multipleChoiceCount > questionCount) ||
    (questionCount !== undefined &&
      shortAnswerCount !== undefined &&
      shortAnswerCount > questionCount) ||
    (multipleChoiceCount !== undefined &&
      shortAnswerCount !== undefined &&
      (multipleChoiceCount + shortAnswerCount < QUIZ_QUESTIONS_MIN ||
        multipleChoiceCount + shortAnswerCount > QUIZ_QUESTIONS_MAX ||
        (questionCount !== undefined &&
          multipleChoiceCount + shortAnswerCount !== questionCount)))
  ) {
    throw createHttpError(400, "question count filters describe an impossible quiz");
  }
  return {
    page,
    limit,
    sort,
    topicIds,
    questionCount,
    multipleChoiceCount,
    shortAnswerCount,
  };
}

function readTopicIds(raw) {
  if (raw == null) return null;
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > QUIZ_TOPIC_IDS_MAX) {
    throw createHttpError(400, `topicIds must contain 1 to ${QUIZ_TOPIC_IDS_MAX} topic ids`);
  }
  const ids = [];
  const seen = new Set();
  for (const id of raw) {
    if (typeof id !== "string" || !id.trim()) {
      throw createHttpError(400, "topicIds must contain topic ids");
    }
    const value = id.trim();
    if (seen.has(value)) {
      throw createHttpError(400, "topicIds must be unique");
    }
    seen.add(value);
    ids.push(value);
  }
  return ids;
}

function limitTopicPath(path) {
  if (!path) return null;
  return path.length > QUIZ_TOPIC_PATH_MAX ? path.slice(0, QUIZ_TOPIC_PATH_MAX) : path;
}

function readGenerateInput(body) {
  const {
    subjectId,
    topicId = null,
    topicIds: rawTopicIds,
    includeDescendants = true,
    multipleChoiceCount,
    shortAnswerCount,
    difficulty = "medium",
    contextMode = DEFAULT_CONTEXT_MODE,
  } = body || {};

  if (typeof subjectId !== "string" || !subjectId) {
    throw createHttpError(400, "subjectId is required");
  }
  if (topicId !== undefined && topicId !== null && (typeof topicId !== "string" || !topicId)) {
    throw createHttpError(400, "topicId must be a topic id");
  }
  const topicIdsProvided = body != null && Object.prototype.hasOwnProperty.call(body, "topicIds") && body.topicIds != null;
  if (topicIdsProvided && topicId) {
    throw createHttpError(400, "Send topicId or topicIds, not both");
  }
  const topicIds = readTopicIds(rawTopicIds);
  if (typeof includeDescendants !== "boolean") {
    throw createHttpError(400, "includeDescendants must be true or false");
  }
  const mc = readCount(multipleChoiceCount, "multipleChoiceCount");
  const sa = readCount(shortAnswerCount, "shortAnswerCount");
  const total = mc + sa;
  if (total < QUIZ_QUESTIONS_MIN || total > QUIZ_QUESTIONS_MAX) {
    throw createHttpError(
      400,
      `a quiz must have ${QUIZ_QUESTIONS_MIN}-${QUIZ_QUESTIONS_MAX} questions in total`,
    );
  }
  if (!QUIZ_DIFFICULTIES.includes(difficulty)) {
    throw createHttpError(400, `difficulty must be one of ${QUIZ_DIFFICULTIES.join(", ")}`);
  }
  if (!CONTEXT_MODES.includes(contextMode)) {
    throw createHttpError(400, `contextMode must be one of ${CONTEXT_MODES.join(", ")}`);
  }
  return {
    subjectId,
    topicId: topicIds ? null : topicId || null,
    topicIds,
    includeDescendants: topicIds ? false : includeDescendants,
    multipleChoiceCount: mc,
    shortAnswerCount: sa,
    difficulty,
    contextMode,
  };
}

// Selected topics must already have their own notes or documents. Descendants are not checked.
async function assertTopicsComplete(userId, subjectId, topicIds) {
  const topics = await topicsApi.listTopics(userId, subjectId);
  const byId = new Map(topics.map((topic) => [topic.id, topic]));
  for (const id of topicIds) {
    const topic = byId.get(id);
    if (!topic) {
      throw createHttpError(404, "Topic not found");
    }
    if (!topic.contentComplete) {
      throw createHttpError(400, `${topic.name} has no notes or documents`);
    }
  }
}

function shuffleOptions(options, correctOptionIndex) {
  const items = options.map((text, index) => ({ text, correct: index === correctOptionIndex }));
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return {
    options: items.map((item) => item.text),
    correctOptionIndex: items.findIndex((item) => item.correct),
  };
}

function finaliseQuestions(questions) {
  return questions.map((question) => {
    const id = randomUUID();
    const concepts = (question.concepts || []).map((item) => item.trim());
    const sourceRefs = (question.sourceRefs || []).map((item) => item.trim());
    if (question.type === "multiple_choice") {
      const shuffled = shuffleOptions(question.options, question.correctOptionIndex);
      return {
        id,
        type: question.type,
        prompt: question.prompt.trim(),
        concepts,
        sourceRefs,
        options: shuffled.options,
        correctOptionIndex: shuffled.correctOptionIndex,
      };
    }
    return {
      id,
      type: question.type,
      prompt: question.prompt.trim(),
      concepts,
      sourceRefs,
      expectedAnswer: question.expectedAnswer.trim(),
      markingCriteria: question.markingCriteria.map((item) => item.trim()),
    };
  });
}

async function prepareGeneration(userId, body) {
  const settings = readGenerateInput(body);
  if (settings.topicIds) {
    await assertTopicsComplete(userId, settings.subjectId, settings.topicIds);
  } else if (settings.topicId) {
    await assertTopicsComplete(userId, settings.subjectId, [settings.topicId]);
  }
  const context = await assembleContext(userId, {
    subjectId: settings.subjectId,
    topicId: settings.topicId,
    topicIds: settings.topicIds,
    includeDescendants: settings.includeDescendants,
    contextMode: settings.contextMode,
  });
  if (context.insufficient) {
    throw createHttpError(
      422,
      "There is not enough content here yet. Add notes or a document, then try again.",
      { errorCode: "CONTEXT_INSUFFICIENT" },
    );
  }

  const input = prompt.buildInput({
    selectionType: context.selection.type,
    selectionName: context.selection.name,
    multipleChoiceCount: settings.multipleChoiceCount,
    shortAnswerCount: settings.shortAnswerCount,
    difficulty: settings.difficulty,
    contextMode: context.contextMode,
    contextText: context.text,
  });
  const allowedSourceIds = new Set(
    context.manifest
      .filter((entry) => entry.status === "included" || entry.status === "truncated")
      .map((entry) => entry.id),
  );
  const runContext = {
    contextMode: context.contextMode,
    includedChars: context.totals.includedChars,
    sourcesIncluded: countStatus(context.manifest, "included"),
    sourcesTruncated: countStatus(context.manifest, "truncated"),
    sourcesExcluded: countStatus(context.manifest, "excluded"),
  };
  const runScope = {
    subjectId: settings.subjectId,
    ...(settings.topicId ? { topicId: settings.topicId } : {}),
    selectionName: context.selection.name,
    manifest: context.manifest.map(({ type, id, title, path, chars, status }) => ({
      type,
      id,
      title,
      path,
      chars,
      status,
    })),
  };
  return { settings, context, input, allowedSourceIds, runContext, runScope };
}

export async function previewQuiz(userId, body) {
  const prepared = await prepareGeneration(userId, body);
  return {
    selectionName: prepared.context.selection.name,
    inputChars: prepared.input.length,
    maxOutputTokens: prompt.MAX_OUTPUT_TOKENS,
    context: prepared.runContext,
    sources: {
      topics: sourceCounts(prepared.context.manifest, "topic"),
      documents: sourceCounts(prepared.context.manifest, "document"),
    },
  };
}

export async function generateQuiz(userId, body) {
  const requestedTitle = readOptionalTitle(body?.title);
  const { settings, context, input, allowedSourceIds, runContext, runScope } =
    await prepareGeneration(userId, body);
  const { quizTimeoutMs } = getAiConfig();

  const result = await runAiOperation({
    userId,
    operation: prompt.OPERATION,
    promptVersion: prompt.PROMPT_VERSION,
    context: runContext,
    scope: runScope,
    instructions: prompt.INSTRUCTIONS,
    input,
    jsonSchema: prompt.JSON_SCHEMA,
    validate: (data) =>
      prompt.validate(data, {
        multipleChoiceCount: settings.multipleChoiceCount,
        shortAnswerCount: settings.shortAnswerCount,
        allowedSourceIds,
      }),
    maxOutputTokens: prompt.MAX_OUTPUT_TOKENS,
    timeoutMs: quizTimeoutMs,
  });

  const title = requestedTitle || context.selection.name.slice(0, CONTENT_NAME_MAX);
  const stored = await quizzesApi.createQuiz(userId, {
    title,
    subjectId: settings.subjectId,
    topicId: settings.topicId,
    topicIds: settings.topicIds || [],
    subjectName: context.selection.subjectName,
    topicPath: settings.topicIds
      ? limitTopicPath(context.selection.path)
      : context.selection.type === "topic"
        ? limitTopicPath(context.selection.path)
        : null,
    multipleChoiceCount: settings.multipleChoiceCount,
    shortAnswerCount: settings.shortAnswerCount,
    difficulty: settings.difficulty,
    includeDescendants: settings.includeDescendants,
    contextMode: context.contextMode,
    promptVersion: prompt.PROMPT_VERSION,
    questions: finaliseQuestions(result.data.questions),
    sourceManifest: context.manifest,
    sourceSnapshot: context.text,
  });
  return { ...toStudyView(stored), aiRun: result.aiRun };
}

export async function getQuiz(userId, quizId) {
  return toStudyView(await quizzesApi.getQuiz(userId, quizId));
}

export async function renameQuiz(userId, quizId, body) {
  if (typeof body?.title !== "string") {
    throw createHttpError(400, "title must be a string");
  }
  const title = body.title.trim();
  if (!title || title.length > CONTENT_NAME_MAX) {
    throw createHttpError(400, `title must be 1-${CONTENT_NAME_MAX} characters`);
  }
  return toStudyView(await quizzesApi.updateQuizTitle(userId, quizId, title));
}

export function listQuizzes(userId, query) {
  return quizzesApi.listQuizzes(userId, readListQuery(query));
}

export function listQuizAttempts(userId, quizId) {
  return quizzesApi.listQuizAttempts(userId, quizId);
}

export function deleteQuiz(userId, quizId) {
  return quizzesApi.deleteQuiz(userId, quizId);
}

const MODE_LABEL = {
  targeted: "Targeted",
  very_strict: "Very Strict",
  loose: "Loose",
};

function sourceTitles(manifest, refs) {
  const byId = new Map((manifest || []).map((entry) => [entry.id, entry.title]));
  return (refs || []).map((id) => byId.get(id) || id);
}

function exportFilename(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "quiz"}.md`;
}

function renderExport(quiz) {
  const scope = quiz.topicPath || quiz.subjectName;
  const questions = quiz.questions || [];
  const questionLines = questions.map((question, index) => {
    const lines = [`### ${index + 1}. ${question.prompt}`, ""];
    if (question.type === "multiple_choice") {
      lines.push(...question.options.map((option) => `- ${option}`));
    } else {
      lines.push("Short answer");
    }
    return lines.join("\n");
  });
  const keyLines = questions.map((question, index) => {
    const lines = [`### ${index + 1}. ${question.prompt}`, ""];
    if (question.type === "multiple_choice") {
      lines.push(`Correct option: ${question.options[question.correctOptionIndex]}`);
    } else {
      lines.push(`Expected answer: ${question.expectedAnswer}`, "", "Marking criteria:");
      lines.push(...(question.markingCriteria || []).map((item) => `- ${item}`));
    }
    const titles = sourceTitles(quiz.sourceManifest, question.sourceRefs);
    if (titles.length) lines.push("", `Sources: ${titles.join(", ")}`);
    return lines.join("\n");
  });
  return [
    `# ${quiz.title}`,
    "",
    `Scope: ${scope}`,
    `Mode: ${MODE_LABEL[quiz.contextMode] || quiz.contextMode}`,
    `Difficulty: ${quiz.difficulty}`,
    `Questions: ${quiz.multipleChoiceCount} multiple choice, ${quiz.shortAnswerCount} short answer`,
    `Created: ${new Date(quiz.createdAt).toISOString()}`,
    "",
    "## Questions",
    "",
    questionLines.join("\n\n"),
    "",
    "## Answer key",
    "",
    keyLines.join("\n\n"),
    "",
  ].join("\n");
}

export async function exportQuiz(userId, quizId) {
  const quiz = await quizzesApi.getQuiz(userId, quizId);
  return { filename: exportFilename(quiz.title), markdown: renderExport(quiz) };
}
