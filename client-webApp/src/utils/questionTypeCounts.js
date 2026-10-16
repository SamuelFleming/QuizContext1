const COUNT_OPERATIONS = new Set(["quiz_generation", "answer_evaluation"]);

function isPresentCount(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/**
 * Compact summary for Profile Recent Activity and AiRunDetails.
 * Returns null when the operation is unrelated or either total count is unknown.
 * Valid zeros are preserved; missing values are never treated as zero.
 */
export function formatQuestionTypeCounts(run) {
  if (!run || !COUNT_OPERATIONS.has(run.operation)) return null;
  const context = run.context;
  if (!context) return null;
  if (!isPresentCount(context.multipleChoiceCount) || !isPresentCount(context.shortAnswerCount)) {
    return null;
  }
  let text = `${context.multipleChoiceCount} multiple choice · ${context.shortAnswerCount} short answer`;
  if (isPresentCount(context.shortAnswerAiCount)) {
    text += ` · ${context.shortAnswerAiCount} AI-scored short answer`;
  }
  return text;
}
