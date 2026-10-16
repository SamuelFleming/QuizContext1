import { randomUUID } from "node:crypto";
import { getAiConfig } from "../config/aiConfig.js";
import { CONTEXT_MODES, DEFAULT_CONTEXT_MODE } from "../constants/contextModes.js";
import {
  CONTENT_NAME_MAX,
  QUIZ_DIFFICULTIES,
  QUIZ_QUESTIONS_MAX,
  QUIZ_QUESTIONS_MIN,
} from "../constants/validation.js";
import { runAiOperation } from "../openai/aiService.js";
import * as prompt from "../openai/prompts/quizGeneration.js";
import { createHttpError } from "../utils/httpError.js";
import { assembleContext } from "./contextService.js";
import * as quizzesApi from "./dataApi/quizzes.js";
import { toStudyView } from "./quizStudyView.js";

function countStatus(manifest, status) {
  return manifest.filter((entry) => entry.status === status).length;
}

function readCount(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw createHttpError(400, `${name} must be a non-negative integer`);
  }
  return value;
}

function readGenerateInput(body) {
  const {
    subjectId,
    topicId = null,
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
    topicId: topicId || null,
    includeDescendants,
    multipleChoiceCount: mc,
    shortAnswerCount: sa,
    difficulty,
    contextMode,
  };
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

export async function generateQuiz(userId, body) {
  const settings = readGenerateInput(body);
  const context = await assembleContext(userId, {
    subjectId: settings.subjectId,
    topicId: settings.topicId,
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

  const allowedSourceIds = new Set(
    context.manifest
      .filter((entry) => entry.status === "included" || entry.status === "truncated")
      .map((entry) => entry.id),
  );
  const { quizTimeoutMs } = getAiConfig();

  const result = await runAiOperation({
    userId,
    operation: prompt.OPERATION,
    promptVersion: prompt.PROMPT_VERSION,
    context: {
      contextMode: context.contextMode,
      includedChars: context.totals.includedChars,
      sourcesIncluded: countStatus(context.manifest, "included"),
      sourcesTruncated: countStatus(context.manifest, "truncated"),
      sourcesExcluded: countStatus(context.manifest, "excluded"),
    },
    instructions: prompt.INSTRUCTIONS,
    input: prompt.buildInput({
      selectionType: context.selection.type,
      selectionName: context.selection.name,
      multipleChoiceCount: settings.multipleChoiceCount,
      shortAnswerCount: settings.shortAnswerCount,
      difficulty: settings.difficulty,
      contextMode: context.contextMode,
      contextText: context.text,
    }),
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

  const title = context.selection.name.slice(0, CONTENT_NAME_MAX);
  const stored = await quizzesApi.createQuiz(userId, {
    title,
    subjectId: settings.subjectId,
    topicId: settings.topicId,
    subjectName: context.selection.subjectName,
    topicPath: context.selection.type === "topic" ? context.selection.path : null,
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
  return toStudyView(stored);
}

export async function getQuiz(userId, quizId) {
  return toStudyView(await quizzesApi.getQuiz(userId, quizId));
}

export function listQuizzes(userId, limit) {
  return quizzesApi.listQuizzes(userId, limit);
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
