import { createHttpError } from "../utils/httpError.js";
import * as attemptsApi from "./dataApi/attempts.js";
import * as quizzesApi from "./dataApi/quizzes.js";
import { buildEvaluation } from "./evaluationService.js";
import { toStudyView } from "./quizStudyView.js";

// The player sees prompts and its own responses. Answer keys stay on the data API record.
function toPlayer(attempt, quiz) {
  return {
    attempt: {
      id: attempt.id,
      quizId: attempt.quizId,
      status: attempt.status,
      responses: attempt.responses,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
    },
    quiz: toStudyView(quiz),
  };
}

async function playerFor(userId, attempt) {
  return toPlayer(attempt, await quizzesApi.getQuiz(userId, attempt.quizId));
}

export function listRecentAttempts(userId, limit) {
  return attemptsApi.listRecentAttempts(userId, limit);
}

export async function startAttempt(userId, quizId) {
  return playerFor(userId, await attemptsApi.createAttempt(userId, quizId));
}

function sourceTitles(manifest, refs) {
  const byId = new Map((manifest || []).map((entry) => [entry.id, entry]));
  return (refs || []).map((id) => {
    const entry = byId.get(id);
    return { id, title: entry?.title || id };
  });
}

function toResults(attempt, quiz) {
  const marked = new Map((attempt.evaluation?.questions || []).map((item) => [item.questionId, item]));
  const responses = new Map((attempt.responses || []).map((item) => [item.questionId, item]));
  return {
    attempt: {
      id: attempt.id,
      quizId: attempt.quizId,
      status: attempt.status,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      evaluation: {
        score: attempt.evaluation.score,
        maxScore: attempt.evaluation.maxScore,
        percent: attempt.evaluation.percent,
        summary: attempt.evaluation.summary,
        promptVersion: attempt.evaluation.promptVersion,
        evaluatedAt: attempt.evaluation.evaluatedAt,
      },
      results: (quiz.questions || []).map((question) => {
        const item = marked.get(question.id);
        const response = responses.get(question.id);
        const row = {
          questionId: question.id,
          type: question.type,
          prompt: question.prompt,
          response: {
            selectedOptionIndex: response?.selectedOptionIndex ?? null,
            text: response?.text || "",
          },
          result: item?.result,
          score: item?.score,
          explanation: item?.explanation,
          missingConcepts: item?.missingConcepts || [],
          sources: sourceTitles(quiz.sourceManifest, item?.sourceRefs),
        };
        if (question.type === "multiple_choice") {
          return { ...row, options: question.options, correctOption: question.options[question.correctOptionIndex] };
        }
        return {
          ...row,
          expectedAnswer: question.expectedAnswer,
          markingCriteria: question.markingCriteria,
        };
      }),
    },
    quiz: toStudyView(quiz),
  };
}

async function present(userId, attempt) {
  const quiz = await quizzesApi.getQuiz(userId, attempt.quizId);
  if (attempt.status === "evaluated" && attempt.evaluation) {
    return toResults(attempt, quiz);
  }
  return toPlayer(attempt, quiz);
}

async function evaluateAndPresent(userId, attempt) {
  const quiz = await quizzesApi.getQuiz(userId, attempt.quizId);
  try {
    const evaluation = await buildEvaluation(userId, quiz, attempt);
    const saved = await attemptsApi.saveAttemptEvaluation(userId, attempt.id, {
      status: "evaluated",
      evaluation,
    });
    return toResults(saved, quiz);
  } catch (err) {
    if (err.aiErrorCode) {
      await attemptsApi
        .saveAttemptEvaluation(userId, attempt.id, { status: "evaluation_failed", evaluation: null })
        .catch(() => {});
    }
    throw err;
  }
}

export async function getAttempt(userId, attemptId) {
  return present(userId, await attemptsApi.getAttempt(userId, attemptId));
}

export async function saveResponses(userId, attemptId, responses) {
  return playerFor(userId, await attemptsApi.saveAttemptResponses(userId, attemptId, responses));
}

export async function submitAttempt(userId, attemptId, responses) {
  const submitted = await attemptsApi.submitAttempt(userId, attemptId, responses);
  return evaluateAndPresent(userId, submitted);
}

export async function retryEvaluation(userId, attemptId) {
  const attempt = await attemptsApi.getAttempt(userId, attemptId);
  if (attempt.status !== "submitted" && attempt.status !== "evaluation_failed") {
    throw createHttpError(409, "This attempt cannot be evaluated");
  }
  return evaluateAndPresent(userId, attempt);
}
