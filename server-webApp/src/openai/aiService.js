import { estimateCostUsd, getAiConfig } from "../config/aiConfig.js";
import { createAiUsage } from "../services/dataApi/aiUsage.js";
import { createStructuredResponse } from "./aiClient.js";
import { createAiError } from "./aiErrors.js";
import { resolveAiKey } from "./keyResolver.js";
import { getApplicationAllowance } from "./usageLimit.js";

// Best-effort: a usage-logging failure must not fail the user's call. Records never hold
// prompt/source bodies, the key, or a key fingerprint; scope is allow-listed metadata only.
async function recordUsage(userId, record) {
  try {
    await createAiUsage(userId, record);
  } catch {
    console.warn(`AI usage record not written (operation=${record.operation})`);
  }
}

function publicRun(record) {
  return {
    operation: record.operation,
    promptVersion: record.promptVersion,
    providerMode: record.providerMode,
    model: record.model,
    inputTokens: record.inputTokens,
    outputTokens: record.outputTokens,
    estimatedCostUsd: record.estimatedCostUsd,
    status: record.status,
    errorCode: record.errorCode,
    latencyMs: record.latencyMs,
    context: record.context,
    inputChars: record.inputChars,
    maxOutputTokens: record.maxOutputTokens,
    scope: record.scope,
    failures: record.failures,
  };
}

function boundedFailures(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item) => typeof item === "string" && item.length > 0))].slice(0, 20);
}

function sanitizeScope(scope) {
  if (!scope || typeof scope !== "object") return null;
  const safe = {};
  for (const field of ["subjectId", "topicId", "selectionName", "quizId", "attemptId"]) {
    if (typeof scope[field] === "string") safe[field] = scope[field];
  }
  if (Array.isArray(scope.manifest)) {
    safe.manifest = scope.manifest
      .filter((entry) => entry && typeof entry === "object")
      .map(({ type, id, title, path, chars, status }) => ({
        type,
        id,
        title,
        path,
        chars,
        status,
      }));
  }
  return Object.keys(safe).length > 0 ? safe : null;
}

// The single entry point for AI calls. Resolves the key, runs one structured request,
// validates the output, and records usage for success and failure alike.
export async function runAiOperation({
  userId,
  operation,
  promptVersion = null,
  context = null,
  scope = null,
  instructions,
  input,
  jsonSchema,
  validate,
  maxOutputTokens,
  timeoutMs: timeoutOverride,
}) {
  const { model, timeoutMs: defaultTimeout } = getAiConfig();
  const timeoutMs = timeoutOverride > 0 ? timeoutOverride : defaultTimeout;
  const usageScope = sanitizeScope(scope);
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

    if (validate) {
      const validation = validate(result.data);
      const failures = boundedFailures(validation);
      if (validation === false || failures.length > 0) {
        const err = createAiError("AI_INVALID_OUTPUT");
        err.failures = failures;
        err.usage = result.usage;
        err.model = result.model;
        err.latencyMs = result.latencyMs;
        throw err;
      }
    }

    const usageRecord = {
      operation,
      promptVersion,
      context,
      inputChars: input.length,
      maxOutputTokens,
      scope: usageScope,
      failures: [],
      providerMode,
      model: result.model,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      estimatedCostUsd: estimateCostUsd(result.model, result.usage),
      status: "succeeded",
      errorCode: null,
      latencyMs: result.latencyMs,
    };
    await recordUsage(userId, usageRecord);

    return { ...result, providerMode, aiRun: publicRun(usageRecord) };
  } catch (err) {
    if (!err.aiErrorCode) {
      throw err;
    }
    const usage = err.usage || { inputTokens: null, outputTokens: null };
    const usedModel = err.model || model;
    const failures = boundedFailures(err.failures);
    err.failures = failures;
    const usageRecord = {
      operation,
      promptVersion,
      context,
      inputChars: input.length,
      maxOutputTokens,
      scope: usageScope,
      failures,
      providerMode: err.providerMode || providerMode || "application",
      model: usedModel,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      estimatedCostUsd: estimateCostUsd(usedModel, usage),
      status: "failed",
      errorCode: err.aiErrorCode,
      latencyMs: err.latencyMs ?? null,
    };
    await recordUsage(userId, usageRecord);
    err.aiRun = publicRun(usageRecord);
    throw err;
  }
}
