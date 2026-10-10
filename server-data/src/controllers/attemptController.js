import { ATTEMPT_RESPONSE_MAX } from "../constants/content.js";
import { toAttempt, toAttemptSummary } from "../models/attempt.js";
import {
  createAttempt,
  findAttempt,
  findInProgressAttempt,
  listRecentAttempts,
  saveAttemptEvaluation,
  saveAttemptResponses,
  submitAttempt,
} from "../repositories/attemptRepository.js";
import { findQuiz, findQuizTitles } from "../repositories/quizRepository.js";
import { sendData, sendMessage } from "../utils/responses.js";

const NOT_FOUND = "Attempt not found";

function readLimit(raw) {
  if (raw === undefined) return { limit: 20 };
  const limit = Number(raw);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return { error: "limit must be an integer from 1 to 100" };
  }
  return { limit };
}

export async function list(req, res, next) {
  try {
    const parsed = readLimit(req.query.limit);
    if (parsed.error) {
      sendMessage(res, 400, parsed.error);
      return;
    }
    const attempts = await listRecentAttempts(req.userId, parsed.limit);
    const titles = await findQuizTitles(
      req.userId,
      attempts.map((attempt) => attempt.quizId),
    );
    sendData(
      res,
      attempts.map((attempt) => toAttemptSummary(attempt, titles.get(attempt.quizId.toString()) || "Quiz")),
    );
  } catch (err) {
    next(err);
  }
}

function readResponses(raw, quiz) {
  if (!Array.isArray(raw)) return { error: "responses must be a list" };
  const questions = new Map((quiz.questions || []).map((question) => [question.id, question]));
  const seen = new Set();
  const responses = [];
  for (const item of raw) {
    if (!item || typeof item.questionId !== "string" || !questions.has(item.questionId)) {
      return { error: "responses must use question ids from this quiz" };
    }
    if (seen.has(item.questionId)) return { error: "each question can be answered once" };
    seen.add(item.questionId);
    const question = questions.get(item.questionId);
    if (question.type === "multiple_choice") {
      const index = item.selectedOptionIndex;
      if (index !== null && index !== undefined && (!Number.isInteger(index) || index < 0 || index > 3)) {
        return { error: "selectedOptionIndex must be 0-3" };
      }
      responses.push({
        questionId: item.questionId,
        selectedOptionIndex: index ?? null,
        text: "",
      });
    } else {
      const text = item.text ?? "";
      if (typeof text !== "string" || text.length > ATTEMPT_RESPONSE_MAX) {
        return { error: `short answers must be at most ${ATTEMPT_RESPONSE_MAX} characters` };
      }
      responses.push({ questionId: item.questionId, selectedOptionIndex: null, text });
    }
  }
  return { responses };
}

async function ownedAttempt(userId, attemptId) {
  const attempt = await findAttempt(userId, attemptId);
  if (!attempt) return { error: NOT_FOUND, status: 404 };
  const quiz = await findQuiz(userId, attempt.quizId.toString());
  if (!quiz) return { error: NOT_FOUND, status: 404 };
  return { attempt, quiz };
}

export async function create(req, res, next) {
  try {
    const quiz = await findQuiz(req.userId, req.body?.quizId);
    if (!quiz) {
      sendMessage(res, 404, "Quiz not found");
      return;
    }
    const existing = await findInProgressAttempt(req.userId, quiz._id);
    if (existing) {
      sendData(res, toAttempt(existing));
      return;
    }
    sendData(res, toAttempt(await createAttempt(req.userId, quiz._id)), 201);
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const attempt = await findAttempt(req.userId, req.params.attemptId);
    if (!attempt) {
      sendMessage(res, 404, NOT_FOUND);
      return;
    }
    sendData(res, toAttempt(attempt));
  } catch (err) {
    next(err);
  }
}

export async function updateResponses(req, res, next) {
  try {
    const owned = await ownedAttempt(req.userId, req.params.attemptId);
    if (owned.error) {
      sendMessage(res, owned.status, owned.error);
      return;
    }
    if (owned.attempt.status !== "in_progress") {
      sendMessage(res, 409, "This attempt can no longer be changed");
      return;
    }
    const parsed = readResponses(req.body?.responses, owned.quiz);
    if (parsed.error) {
      sendMessage(res, 400, parsed.error);
      return;
    }
    const saved = await saveAttemptResponses(req.userId, owned.attempt._id, parsed.responses);
    if (!saved) {
      sendMessage(res, 409, "This attempt can no longer be changed");
      return;
    }
    sendData(res, toAttempt(saved));
  } catch (err) {
    next(err);
  }
}

export async function submit(req, res, next) {
  try {
    const owned = await ownedAttempt(req.userId, req.params.attemptId);
    if (owned.error) {
      sendMessage(res, owned.status, owned.error);
      return;
    }
    if (owned.attempt.status !== "in_progress") {
      sendMessage(res, 409, "This attempt has already been submitted");
      return;
    }
    const parsed = readResponses(req.body?.responses, owned.quiz);
    if (parsed.error) {
      sendMessage(res, 400, parsed.error);
      return;
    }
    const saved = await submitAttempt(req.userId, owned.attempt._id, parsed.responses, new Date());
    if (!saved) {
      sendMessage(res, 409, "This attempt has already been submitted");
      return;
    }
    sendData(res, toAttempt(saved));
  } catch (err) {
    next(err);
  }
}

const RESULTS = ["correct", "partial", "incorrect"];
const SCORE_FOR = { correct: 1, partial: 0.5, incorrect: 0 };

function readEvaluation(raw, quiz) {
  if (!raw || typeof raw !== "object") return { error: "evaluation is required" };
  const questions = quiz.questions || [];
  const allowedRefs = new Set(
    (quiz.sourceManifest || [])
      .filter((entry) => entry.status === "included" || entry.status === "truncated")
      .map((entry) => entry.id),
  );
  if (!Array.isArray(raw.questions) || raw.questions.length !== questions.length) {
    return { error: "evaluation must include every question" };
  }
  const byId = new Map(raw.questions.map((item) => [item?.questionId, item]));
  let total = 0;
  const stored = [];
  for (const question of questions) {
    const item = byId.get(question.id);
    if (!item || !RESULTS.includes(item.result)) return { error: "evaluation result is invalid" };
    if (item.score !== SCORE_FOR[item.result]) return { error: "evaluation score does not match the result" };
    if (typeof item.explanation !== "string" || item.explanation.length > 1000) {
      return { error: "explanation must be at most 1000 characters" };
    }
    if (!Array.isArray(item.missingConcepts) || item.missingConcepts.length > 5) {
      return { error: "missingConcepts must have at most 5 items" };
    }
    if (item.missingConcepts.some((concept) => typeof concept !== "string" || concept.length > 200)) {
      return { error: "missingConcepts are invalid" };
    }
    if (!Array.isArray(item.sourceRefs) || item.sourceRefs.some((id) => !allowedRefs.has(id))) {
      return { error: "sourceRefs must come from the quiz manifest" };
    }
    total += item.score;
    stored.push({
      questionId: question.id,
      result: item.result,
      score: item.score,
      explanation: item.explanation,
      missingConcepts: item.missingConcepts,
      sourceRefs: item.sourceRefs,
    });
  }
  if (raw.score !== total || raw.maxScore !== questions.length) return { error: "overall score is invalid" };
  if (!Number.isInteger(raw.percent) || raw.percent < 0 || raw.percent > 100) {
    return { error: "percent is invalid" };
  }
  if (typeof raw.summary !== "string" || !raw.summary.trim() || raw.summary.length > 500) {
    return { error: "summary is invalid" };
  }
  if (raw.promptVersion !== null && (typeof raw.promptVersion !== "string" || raw.promptVersion.length > 80)) {
    return { error: "promptVersion is invalid" };
  }
  if (typeof raw.evaluatedAt !== "string" || Number.isNaN(Date.parse(raw.evaluatedAt))) {
    return { error: "evaluatedAt is invalid" };
  }
  return {
    evaluation: {
      questions: stored,
      score: raw.score,
      maxScore: raw.maxScore,
      percent: raw.percent,
      summary: raw.summary.trim(),
      promptVersion: raw.promptVersion,
      evaluatedAt: raw.evaluatedAt,
    },
  };
}

export async function saveEvaluation(req, res, next) {
  try {
    const owned = await ownedAttempt(req.userId, req.params.attemptId);
    if (owned.error) {
      sendMessage(res, owned.status, owned.error);
      return;
    }
    if (owned.attempt.status !== "submitted" && owned.attempt.status !== "evaluation_failed") {
      sendMessage(res, 409, "This attempt cannot be evaluated");
      return;
    }
    const { status, evaluation } = req.body || {};
    if (status === "evaluation_failed") {
      const saved = await saveAttemptEvaluation(req.userId, owned.attempt._id, {
        status,
        evaluation: null,
      });
      if (!saved) {
        sendMessage(res, 409, "This attempt cannot be evaluated");
        return;
      }
      sendData(res, toAttempt(saved));
      return;
    }
    if (status !== "evaluated") {
      sendMessage(res, 400, "status must be evaluated or evaluation_failed");
      return;
    }
    const parsed = readEvaluation(evaluation, owned.quiz);
    if (parsed.error) {
      sendMessage(res, 400, parsed.error);
      return;
    }
    const saved = await saveAttemptEvaluation(req.userId, owned.attempt._id, {
      status,
      evaluation: parsed.evaluation,
    });
    if (!saved) {
      sendMessage(res, 409, "This attempt cannot be evaluated");
      return;
    }
    sendData(res, toAttempt(saved));
  } catch (err) {
    next(err);
  }
}
