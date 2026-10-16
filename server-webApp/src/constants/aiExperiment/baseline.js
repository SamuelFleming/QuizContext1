import { run } from "./active.js";

const CONTEXT_MIN_CHARS = 200;
const APP_MONTHLY_TOKEN_LIMIT = 100000;
const DEFAULT_OUTPUT_TOKENS = 8000;
const REASONING_EFFORTS = new Set(["none", "low", "medium", "high", "xhigh", "max"]);

let warnedOutput = false;
let warnedEffort = false;

function readOutputTokens(value) {
  if (Number.isInteger(value) && value >= 1000 && value <= 128000) {
    return value;
  }
  if (!warnedOutput) {
    warnedOutput = true;
    console.warn("AI experiment quizMaxOutputTokens is invalid; using 8000");
  }
  return DEFAULT_OUTPUT_TOKENS;
}

function readReasoningEffort(value) {
  if (value === null || REASONING_EFFORTS.has(value)) {
    return value;
  }
  if (!warnedEffort) {
    warnedEffort = true;
    console.warn("AI experiment reasoningEffort is invalid; omitting it");
  }
  return null;
}

// Fixed baseline values are applied after the selected run, so a run file cannot replace them.
export function mergeExperimentConfig(selected) {
  return {
    id: selected.id,
    model: selected.model,
    contextMaxChars: selected.contextMaxChars,
    quizMaxOutputTokens: readOutputTokens(selected.quizMaxOutputTokens),
    quizTimeoutMs: selected.quizTimeoutMs,
    reasoningEffort: readReasoningEffort(selected.reasoningEffort),
    contextMinChars: CONTEXT_MIN_CHARS,
    appMonthlyTokenLimit: APP_MONTHLY_TOKEN_LIMIT,
  };
}

export function getExperimentConfig() {
  return mergeExperimentConfig(run);
}
