import { getExperimentConfig } from "../constants/aiExperiment/baseline.js";
import { getModelMeta } from "../constants/aiModels.js";

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
