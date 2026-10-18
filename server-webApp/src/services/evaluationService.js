import { runAiOperation } from "../openai/aiService.js";
import * as prompt from "../openai/prompts/answerEvaluation.js";

const SCORE_FOR = { correct: 1, partial: 0.5, incorrect: 0 };

function responseFor(attempt, questionId) {
  return (attempt.responses || []).find((item) => item.questionId === questionId) || null;
}

function isBlank(text) {
  return typeof text !== "string" || text.trim() === "";
}

function allowedSourceIds(quiz) {
  return new Set(
    (quiz.sourceManifest || [])
      .filter((entry) => entry.status === "included" || entry.status === "truncated")
      .map((entry) => entry.id),
  );
}

function contextCounts(quiz, { shortAnswerAiCount = null } = {}) {
  const manifest = quiz.sourceManifest || [];
  return {
    contextMode: quiz.contextMode,
    includedChars: (quiz.sourceSnapshot || "").length,
    sourcesIncluded: manifest.filter((entry) => entry.status === "included").length,
    sourcesTruncated: manifest.filter((entry) => entry.status === "truncated").length,
    sourcesExcluded: manifest.filter((entry) => entry.status === "excluded").length,
    multipleChoiceCount: quiz.multipleChoiceCount ?? null,
    shortAnswerCount: quiz.shortAnswerCount ?? null,
    shortAnswerAiCount,
  };
}

function formatScore(score) {
  return Number.isInteger(score) ? String(score) : String(Math.round(score * 10) / 10);
}

function marked(question, result, explanation, missingConcepts, sourceRefs) {
  return {
    questionId: question.id,
    result,
    score: SCORE_FOR[result],
    explanation,
    missingConcepts,
    sourceRefs,
  };
}

function markMultipleChoice(question, response) {
  const selected = response?.selectedOptionIndex;
  const correct = selected === question.correctOptionIndex;
  return marked(
    question,
    correct ? "correct" : "incorrect",
    correct
      ? "The selected option matches the saved answer."
      : "The selected option does not match the saved answer.",
    [],
    question.sourceRefs || [],
  );
}

function markBlank(question) {
  return marked(question, "incorrect", "No answer was submitted.", [], question.sourceRefs || []);
}

export async function buildEvaluation(userId, quiz, attempt) {
  const questions = quiz.questions || [];
  const refs = allowedSourceIds(quiz);
  const pending = [];
  const local = new Map();

  for (const question of questions) {
    const response = responseFor(attempt, question.id);
    if (question.type === "multiple_choice") {
      local.set(question.id, markMultipleChoice(question, response));
      continue;
    }
    if (isBlank(response?.text)) {
      local.set(question.id, markBlank(question));
      continue;
    }
    pending.push({
      id: question.id,
      prompt: question.prompt,
      expectedAnswer: question.expectedAnswer,
      markingCriteria: question.markingCriteria || [],
      learnerText: response.text,
      sourceRefs: question.sourceRefs || [],
    });
  }

  let promptVersion = null;
  if (pending.length > 0) {
    const result = await runAiOperation({
      userId,
      operation: prompt.OPERATION,
      promptVersion: prompt.PROMPT_VERSION,
      context: contextCounts(quiz, { shortAnswerAiCount: pending.length }),
      scope: { quizId: quiz.id, attemptId: attempt.id },
      instructions: prompt.INSTRUCTIONS,
      input: prompt.buildInput({
        contextMode: quiz.contextMode,
        questions: pending,
        sourceSnapshot: quiz.sourceSnapshot || "",
      }),
      jsonSchema: prompt.JSON_SCHEMA,
      validate: (data) =>
        prompt.validate(data, {
          questionIds: pending.map((question) => question.id),
          allowedSourceIds: refs,
        }),
      maxOutputTokens: prompt.MAX_OUTPUT_TOKENS,
    });
    promptVersion = prompt.PROMPT_VERSION;
    for (const item of result.data.questions) {
      const question = questions.find((entry) => entry.id === item.questionId);
      local.set(
        item.questionId,
        marked(question, item.result, item.explanation, item.missingConcepts, item.sourceRefs),
      );
    }
  }

  const stored = questions.map((question) => local.get(question.id));
  const score = stored.reduce((sum, item) => sum + item.score, 0);
  const maxScore = questions.length;
  const percent = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
  return {
    questions: stored,
    score,
    maxScore,
    percent,
    summary: `You scored ${formatScore(score)} out of ${maxScore} (${percent}%).`,
    promptVersion,
    evaluatedAt: new Date().toISOString(),
  };
}
