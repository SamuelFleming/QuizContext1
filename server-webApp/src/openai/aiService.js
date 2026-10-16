import { estimateCostUsd, getAiConfig } from "../config/aiConfig.js";
import { createAiUsage } from "../services/dataApi/aiUsage.js";
import { createStructuredResponse } from "./aiClient.js";
import { createAiError } from "./aiErrors.js";
import { resolveAiKey } from "./keyResolver.js";
import { getApplicationAllowance } from "./usageLimit.js";

// Best-effort: a usage-logging failure must not fail the user's call. Records never hold
// prompt text, the key, or a key fingerprint.
async function recordUsage(userId, record) {
  try {
    await createAiUsage(userId, record);
  } catch {
    console.warn(`AI usage record not written (operation=${record.operation})`);
  }
}

// The single entry point for AI calls. Resolves the key, runs one structured request,
// validates the output, and records usage for success and failure alike.
export async function runAiOperation({
  userId,
  operation,
  instructions,
  input,
  jsonSchema,
  validate,
  maxOutputTokens,
}) {
  const { model, timeoutMs } = getAiConfig();
  let providerMode = null;

  try {
    const resolved = await resolveAiKey(userId);
    providerMode = resolved.providerMode;

    if (providerMode === "application") {
      const allowance = await getApplicationAllowance(userId);
      if (allowance.remainingTokens <= 0) {
        throw createAiError("AI_LIMIT_REACHED");
      }
    }

    const result = await createStructuredResponse({
      apiKey: resolved.apiKey,
      model,
      timeoutMs,
      instructions,
      input,
      jsonSchema,
      maxOutputTokens,
    });

    if (validate && !validate(result.data)) {
      const err = createAiError("AI_INVALID_OUTPUT");
      err.usage = result.usage;
      err.model = result.model;
      err.latencyMs = result.latencyMs;
      throw err;
    }

    await recordUsage(userId, {
      operation,
      providerMode,
      model: result.model,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      estimatedCostUsd: estimateCostUsd(result.model, result.usage),
      status: "succeeded",
      errorCode: null,
      latencyMs: result.latencyMs,
    });

    return { ...result, providerMode };
  } catch (err) {
    if (!err.aiErrorCode) {
      throw err;
    }
    const usage = err.usage || { inputTokens: null, outputTokens: null };
    const usedModel = err.model || model;
    await recordUsage(userId, {
      operation,
      providerMode: err.providerMode || providerMode || "application",
      model: usedModel,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      estimatedCostUsd: estimateCostUsd(usedModel, usage),
      status: "failed",
      errorCode: err.aiErrorCode,
      latencyMs: err.latencyMs ?? null,
    });
    throw err;
  }
}
