import OpenAI from "openai";
import { createAiError } from "./aiErrors.js";

function classifyProviderError(error) {
  if (error?.aiErrorCode) {
    return error;
  }
  if (error?.name === "APIConnectionTimeoutError" || error?.name === "APIUserAbortError") {
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

function parseOutput(response) {
  const refused = (response?.output || []).some((item) =>
    (item?.content || []).some((part) => part?.type === "refusal"),
  );
  if (refused || response?.status === "incomplete") {
    throw createAiError("AI_INVALID_OUTPUT");
  }
  const text = typeof response?.output_text === "string" ? response.output_text.trim() : "";
  try {
    return JSON.parse(text);
  } catch {
    throw createAiError("AI_INVALID_OUTPUT");
  }
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
}) {
  const client = new OpenAI({ apiKey, maxRetries: 0, timeout: timeoutMs });
  const startedAt = Date.now();
  try {
    const response = await client.responses.create({
      model,
      instructions,
      input,
      max_output_tokens: maxOutputTokens,
      store: false,
      text: {
        format: { type: "json_schema", name: jsonSchema.name, schema: jsonSchema.schema, strict: true },
      },
    });
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
    throw aiError;
  }
}
