import { getExperimentConfig } from "../constants/aiExperiment/baseline.js";

// USD per 1M tokens. Placeholder figures to verify against current OpenAI pricing.
// During the experiment, the selected run file supplies prices for its own model.
const PRICES_PER_1M = {
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4.1-mini": { input: 0.4, output: 1.6 },
};

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

function matchesModel(model, selected) {
  return model === selected || (selected && model?.startsWith(`${selected}-`));
}

function priceFor(model) {
  const experiment = getExperimentConfig();
  if (matchesModel(model, experiment.model)) {
    const input = experiment.priceInputPer1M;
    const output = experiment.priceOutputPer1M;
    if (input > 0 && output > 0) {
      return { input, output };
    }
    return null;
  }
  const known = Object.keys(PRICES_PER_1M).find((name) => model === name || model?.startsWith(`${name}-`));
  return known ? PRICES_PER_1M[known] : null;
}

export function estimateCostUsd(model, { inputTokens, outputTokens }) {
  const price = priceFor(model);
  if (!price || inputTokens == null || outputTokens == null) {
    return null;
  }
  const cost = (inputTokens * price.input + outputTokens * price.output) / 1_000_000;
  return Number(cost.toFixed(6));
}
