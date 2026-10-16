import { estimateCostUsd } from "../src/config/aiConfig.js";
import { getExperimentConfig } from "../src/constants/aiExperiment/baseline.js";
import { resolveModel } from "../src/constants/aiModels.js";

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

console.log("checkAiModels: ok");
