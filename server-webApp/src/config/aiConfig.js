import { getExperimentConfig } from "../constants/aiExperiment/baseline.js";
import { getModelMeta } from "../constants/aiModels.js";

/** Rough English chars-per-token for pre-call approximations only — not provider billing. */
export const CHARS_PER_TOKEN_ESTIMATE = 4;

export function getAiConfig() {
  const experiment = getExperimentConfig();
  return {
    enabled: process.env.AI_ENABLED === "true",
    applicationKey: process.env.OPENAI_API_KEY || "",
    model: experiment.model,
    timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 20000,
    quizTimeoutMs: experiment.quizTimeoutMs,
    quizMaxOutputTokens: experiment.quizMaxOutputTokens,
    reasoningEffort: experiment.reasoningEffort,
    appMonthlyTokenLimit: experiment.appMonthlyTokenLimit,
  };
}

export function estimateCostUsd(model, { inputTokens, outputTokens }) {
  const meta = getModelMeta(model);
  if (!meta || inputTokens == null || outputTokens == null) {
    return null;
  }
  const cost =
    (inputTokens * meta.priceInputPer1M + outputTokens * meta.priceOutputPer1M) / 1_000_000;
  return Number(cost.toFixed(6));
}

export function estimateTokensFromChars(charCount) {
  if (charCount == null || !Number.isFinite(charCount) || charCount < 0) {
    return null;
  }
  return Math.ceil(charCount / CHARS_PER_TOKEN_ESTIMATE);
}

/**
 * Pre-call quiz cost approximation from catalogue rates.
 * Input tokens use chars÷4 (including instructions). Output $ is a ceiling at maxOutputTokens.
 */
export function estimateQuizPreviewCost(model, { inputChars, instructionsChars, maxOutputTokens }) {
  const meta = getModelMeta(model);
  const billableChars = (inputChars ?? 0) + (instructionsChars ?? 0);
  const estimatedInputTokens = estimateTokensFromChars(billableChars);
  if (!meta || estimatedInputTokens == null || maxOutputTokens == null) {
    return {
      estimatedInputTokens,
      estimatedInputCostUsd: null,
      estimatedOutputCostUsd: null,
      estimatedTotalCostUsd: null,
    };
  }
  const estimatedInputCostUsd = Number(
    ((estimatedInputTokens * meta.priceInputPer1M) / 1_000_000).toFixed(6),
  );
  const estimatedOutputCostUsd = Number(
    ((maxOutputTokens * meta.priceOutputPer1M) / 1_000_000).toFixed(6),
  );
  return {
    estimatedInputTokens,
    estimatedInputCostUsd,
    estimatedOutputCostUsd,
    estimatedTotalCostUsd: Number((estimatedInputCostUsd + estimatedOutputCostUsd).toFixed(6)),
  };
}
