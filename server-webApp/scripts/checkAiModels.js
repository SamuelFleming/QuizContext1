import {
  CHARS_PER_TOKEN_ESTIMATE,
  estimateCostUsd,
  estimateQuizPreviewCost,
  estimateTokensFromChars,
} from "../src/config/aiConfig.js";
import { getExperimentConfig } from "../src/constants/aiExperiment/baseline.js";
import { listModels, resolveModel } from "../src/constants/aiModels.js";
import * as prompt from "../src/openai/prompts/quizGeneration.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const million = { inputTokens: 1_000_000, outputTokens: 1_000_000 };

assert(estimateCostUsd("gpt-6-luna", million) === 0.6, "luna 1M+1M should be 0.6");
assert(
  estimateCostUsd("gpt-6-luna-2026-01-01", million) === 0.6,
  "dated luna snapshot should match catalogue rates"
);
assert(estimateCostUsd("gpt-4o-mini", million) === 0.75, "4o-mini 1M+1M should be 0.75");
assert(estimateCostUsd("not-a-model", million) === null, "unknown model cost should be null");

const defaultModel = resolveModel({});
assert(
  defaultModel === getExperimentConfig().model,
  `resolveModel() should default to experiment model (got ${defaultModel})`
);

let threw = false;
try {
  resolveModel({ requestedModel: "not-a-model" });
} catch (err) {
  threw = true;
  assert(err.aiErrorCode === "AI_UNKNOWN_MODEL", "unknown model should throw AI_UNKNOWN_MODEL");
  assert(err.statusCode === 400, "unknown model should be HTTP 400");
}
assert(threw, "resolveModel with unknown id should throw");

assert(
  resolveModel({ requestedModel: "gpt-6-luna-2026-01-01" }) === "gpt-6-luna-2026-01-01",
  "explicit dated snapshot should pass through when catalogue base matches"
);

const models = listModels();
assert(Array.isArray(models) && models.length >= 5, "listModels should return catalogue rows");
const luna = models.find((row) => row.id === "gpt-6-luna");
assert(luna?.displayName === "Luna", "luna displayName should be Luna");
assert(luna?.priceInputPer1M === 0.1 && luna?.priceOutputPer1M === 0.5, "luna rates on list");
for (const row of models) {
  assert(typeof row.id === "string" && row.id, "each model needs id");
  assert(typeof row.displayName === "string" && row.displayName, "each model needs displayName");
  assert(typeof row.priceInputPer1M === "number", "each model needs priceInputPer1M");
  assert(typeof row.priceOutputPer1M === "number", "each model needs priceOutputPer1M");
}

assert(CHARS_PER_TOKEN_ESTIMATE === 4, "chars-per-token heuristic should be 4");
assert(estimateTokensFromChars(1) === 1, "1 char → 1 token");
assert(estimateTokensFromChars(4) === 1, "4 chars → 1 token");
assert(estimateTokensFromChars(5) === 2, "5 chars → 2 tokens");

const inputChars = 100;
const maxOutputTokens = 16_000;
const billable = inputChars + prompt.INSTRUCTIONS.length;
const expectedInputTokens = Math.ceil(billable / 4);
const preview = estimateQuizPreviewCost("gpt-6-luna", {
  inputChars,
  instructionsChars: prompt.INSTRUCTIONS.length,
  maxOutputTokens,
});
assert(preview.estimatedInputTokens === expectedInputTokens, "preview input token estimate");
assert(
  preview.estimatedInputCostUsd ===
    Number(((expectedInputTokens * 0.1) / 1_000_000).toFixed(6)),
  "preview input cost"
);
assert(
  preview.estimatedOutputCostUsd === Number(((maxOutputTokens * 0.5) / 1_000_000).toFixed(6)),
  "preview output ceiling cost"
);
assert(
  preview.estimatedTotalCostUsd ===
    Number((preview.estimatedInputCostUsd + preview.estimatedOutputCostUsd).toFixed(6)),
  "preview total cost"
);

console.log("checkAiModels: ok");
