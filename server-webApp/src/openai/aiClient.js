import OpenAI, { APIConnectionTimeoutError, APIUserAbortError } from "openai";
import { createAiError } from "./aiErrors.js";

function classifyProviderError(error) {
  if (error?.aiErrorCode) {
    return error;
  }
  // SDK Error subclasses keep .name as "Error"; match by class / constructor.
  if (
    error instanceof APIConnectionTimeoutError ||
    error instanceof APIUserAbortError ||
    error?.constructor?.name === "APIConnectionTimeoutError" ||
    error?.constructor?.name === "APIUserAbortError"
  ) {
    return createAiError("AI_TIMEOUT");
  }
  if (error?.status === 401 || error?.status === 403) {
    return createAiError("AI_AUTH_FAILED");
  }
  if (error?.status === 429) {
    return createAiError("AI_RATE_LIMITED");
  }
  return createAiError("AI_PROVIDER_ERROR");
}

function invalidOutput(failure) {
  const error = createAiError("AI_INVALID_OUTPUT");
  error.failures = [failure];
  return error;
}

function parseOutput(response) {
  if (response?.status === "incomplete") {
    throw invalidOutput("output_truncated");
  }
  const refused = (response?.output || []).some((item) =>
    (item?.content || []).some((part) => part?.type === "refusal"),
  );
  if (refused) {
    throw invalidOutput("output_refused");
  }
  const text = typeof response?.output_text === "string" ? response.output_text.trim() : "";
  try {
    return JSON.parse(text);
  } catch {
    throw invalidOutput("output_not_json");
  }
}

export function buildStructuredRequest({
  model,
  instructions,
  input,
  jsonSchema,
  maxOutputTokens,
  reasoningEffort = null,
}) {
  const request = {
    model,
    instructions,
    input,
    max_output_tokens: maxOutputTokens,
    store: false,
    text: {
      format: { type: "json_schema", name: jsonSchema.name, schema: jsonSchema.schema, strict: true },
    },
  };
  if (typeof reasoningEffort === "string") {
    request.reasoning = { effort: reasoningEffort };
  }
  return request;
}

// One schema-constrained request. A new SDK client is built per call so a per-user key is
// never served from a cache built for another key.
export async function createStructuredResponse({
  apiKey,
  model,
  timeoutMs,
  instructions,
  input,
  jsonSchema,
  maxOutputTokens = 1000,
  reasoningEffort = null,
}) {
  const client = new OpenAI({ apiKey, maxRetries: 0, timeout: timeoutMs });
  const startedAt = Date.now();
  let response;
  try {
    response = await client.responses.create(
      buildStructuredRequest({
        model,
        instructions,
        input,
        jsonSchema,
        maxOutputTokens,
        reasoningEffort,
      }),
    );
    return {
      data: parseOutput(response),
      model: response?.model || model,
      usage: {
        inputTokens: response?.usage?.input_tokens ?? null,
        outputTokens: response?.usage?.output_tokens ?? null,
      },
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    const aiError = classifyProviderError(error);
    aiError.latencyMs = Date.now() - startedAt;
    if (response && aiError.aiErrorCode === "AI_INVALID_OUTPUT") {
      aiError.model = response.model || model;
      aiError.usage = {
        inputTokens: response?.usage?.input_tokens ?? null,
        outputTokens: response?.usage?.output_tokens ?? null,
      };
    }
    throw aiError;
  }
}
