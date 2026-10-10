// Placeholder default; verify against OpenAI's live model catalogue before relying on it.
const DEFAULT_MODEL = "gpt-4o-mini";

// USD per 1M tokens. Placeholder figures to verify against current OpenAI pricing.
// AI_PRICE_INPUT_PER_1M / AI_PRICE_OUTPUT_PER_1M override the entry for AI_MODEL_DEFAULT.
const PRICES_PER_1M = {
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4.1-mini": { input: 0.4, output: 1.6 },
};

export function getAiConfig() {
  return {
    enabled: process.env.AI_ENABLED === "true",
    applicationKey: process.env.OPENAI_API_KEY || "",
    model: process.env.AI_MODEL_DEFAULT || DEFAULT_MODEL,
    timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 20000,
    quizTimeoutMs: Number(process.env.AI_QUIZ_TIMEOUT_MS) || 60000,
    appMonthlyTokenLimit: readLimit(process.env.AI_APP_MONTHLY_TOKEN_LIMIT),
  };
}

const DEFAULT_APP_MONTHLY_TOKEN_LIMIT = 100000;

function readLimit(raw) {
  const value = Number(raw);
  return raw !== undefined && raw !== "" && Number.isFinite(value) && value >= 0
    ? value
    : DEFAULT_APP_MONTHLY_TOKEN_LIMIT;
}

function priceFor(model) {
  const { model: defaultModel } = getAiConfig();
  const input = Number(process.env.AI_PRICE_INPUT_PER_1M);
  const output = Number(process.env.AI_PRICE_OUTPUT_PER_1M);
  if (model === defaultModel && input > 0 && output > 0) {
    return { input, output };
  }
  // Provider responses can name a dated snapshot, e.g. gpt-4o-mini-2024-07-18.
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
