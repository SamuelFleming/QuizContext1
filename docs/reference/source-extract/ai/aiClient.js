// server/src/services/ai/aiClient.js

const { OpenAI } = require('openai');
const { getAiConfig, resolveModel } = require('./aiConfig');
const { AI_ERROR_CODES, createAiError } = require('./aiErrors');

let cachedClient = null;
let cachedKey = null;

const getClient = (config) => {
  if (!cachedClient || cachedKey !== config.apiKey) {
    // Retries are handled here rather than in the SDK so the retry policy stays
    // aligned with the error taxonomy (only retryable codes are retried).
    cachedClient = new OpenAI({ apiKey: config.apiKey, maxRetries: 0 });
    cachedKey = config.apiKey;
  }

  return cachedClient;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const backoffDelayMs = (attempt) => {
  const base = 500 * 2 ** attempt;
  return base + Math.floor(Math.random() * 250);
};

const classifyProviderError = (error) => {
  if (error?.name === 'APIUserAbortError' || error?.name === 'APIConnectionTimeoutError') {
    return AI_ERROR_CODES.AI_TIMEOUT;
  }

  if (error?.status === 429) {
    return AI_ERROR_CODES.AI_RATE_LIMITED;
  }

  if (error?.status === 401 || error?.status === 403) {
    return AI_ERROR_CODES.AI_DISABLED;
  }

  return AI_ERROR_CODES.AI_PROVIDER_ERROR;
};

const findRefusal = (response) => {
  const outputItems = Array.isArray(response?.output) ? response.output : [];

  for (const item of outputItems) {
    const parts = Array.isArray(item?.content) ? item.content : [];
    const refusal = parts.find((part) => part?.type === 'refusal');

    if (refusal) {
      return refusal.refusal || 'The AI declined to complete this request.';
    }
  }

  return null;
};

const assertUsableResponse = (response) => {
  const refusal = findRefusal(response);

  if (refusal) {
    throw createAiError(AI_ERROR_CODES.AI_REFUSED, refusal);
  }

  if (response?.status === 'incomplete') {
    const reason = response?.incomplete_details?.reason || 'unknown reason';
    throw createAiError(
      AI_ERROR_CODES.AI_INCOMPLETE,
      `The AI response was cut short (${reason}). Please try again.`
    );
  }
};

const parseJsonOutput = (response) => {
  const text = typeof response?.output_text === 'string' ? response.output_text.trim() : '';

  if (!text) {
    throw createAiError(
      AI_ERROR_CODES.AI_INVALID_OUTPUT,
      'The AI returned an empty result.'
    );
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw createAiError(
      AI_ERROR_CODES.AI_INVALID_OUTPUT,
      'The AI returned a result that could not be parsed.',
      error
    );
  }
};

/**
 * Sends one schema-constrained request and returns the parsed object plus run metadata.
 * Flows never talk to the provider SDK directly — they call through here.
 *
 * @param {Object} params
 * @param {string} params.flowClass - extraction | polish | evaluation | generation
 * @param {string} params.instructions - system/developer message (static per prompt version)
 * @param {string} params.input - user message; untrusted source text must already be delimited
 * @param {{ name: string, schema: Object }} params.jsonSchema
 * @param {number} [params.maxOutputTokens]
 * @returns {Promise<{ data: Object, model: string, usage: Object, latencyMs: number }>}
 */
const createStructuredResponse = async ({
  flowClass,
  instructions,
  input,
  jsonSchema,
  maxOutputTokens = 4000,
}) => {
  const config = getAiConfig();

  if (!config.enabled) {
    throw createAiError(AI_ERROR_CODES.AI_DISABLED);
  }

  const totalChars = (instructions || '').length + (input || '').length;

  if (totalChars > config.maxInputChars) {
    throw createAiError(
      AI_ERROR_CODES.AI_INPUT_TOO_LARGE,
      `There is too much content to send to the AI in one request (${totalChars} characters, limit ${config.maxInputChars}).`
    );
  }

  const client = getClient(config);
  const model = resolveModel(flowClass);
  const startedAt = Date.now();

  let lastError = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
    try {
      const response = await client.responses.create(
        {
          model,
          instructions,
          input,
          max_output_tokens: maxOutputTokens,
          // MongoDB is the system of record; no provider-side state holds career evidence.
          store: false,
          text: {
            format: {
              type: 'json_schema',
              name: jsonSchema.name,
              schema: jsonSchema.schema,
              strict: true,
            },
          },
        },
        { timeout: config.timeoutMs }
      );

      assertUsableResponse(response);

      return {
        data: parseJsonOutput(response),
        model: response?.model || model,
        usage: {
          inputTokens: response?.usage?.input_tokens ?? null,
          outputTokens: response?.usage?.output_tokens ?? null,
        },
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      const aiError = error?.aiErrorCode
        ? error
        : createAiError(classifyProviderError(error), null, error);

      if (!aiError.retryable || attempt === config.maxRetries) {
        throw aiError;
      }

      lastError = aiError;
      await sleep(backoffDelayMs(attempt));
    }
  }

  throw lastError || createAiError(AI_ERROR_CODES.AI_PROVIDER_ERROR);
};

module.exports = {
  createStructuredResponse,
};
