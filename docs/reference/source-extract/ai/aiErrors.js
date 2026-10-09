// server/src/services/ai/aiErrors.js

const { createServiceError } = require('../../utils/serviceError');

const AI_ERROR_CODES = {
  AI_DISABLED: 'AI_DISABLED',
  AI_TIMEOUT: 'AI_TIMEOUT',
  AI_RATE_LIMITED: 'AI_RATE_LIMITED',
  AI_PROVIDER_ERROR: 'AI_PROVIDER_ERROR',
  AI_REFUSED: 'AI_REFUSED',
  AI_INCOMPLETE: 'AI_INCOMPLETE',
  AI_INVALID_OUTPUT: 'AI_INVALID_OUTPUT',
  AI_INPUT_TOO_LARGE: 'AI_INPUT_TOO_LARGE',
};

const AI_ERROR_STATUS = {
  [AI_ERROR_CODES.AI_DISABLED]: 503,
  [AI_ERROR_CODES.AI_TIMEOUT]: 504,
  [AI_ERROR_CODES.AI_RATE_LIMITED]: 429,
  [AI_ERROR_CODES.AI_PROVIDER_ERROR]: 502,
  [AI_ERROR_CODES.AI_REFUSED]: 422,
  [AI_ERROR_CODES.AI_INCOMPLETE]: 422,
  [AI_ERROR_CODES.AI_INVALID_OUTPUT]: 422,
  [AI_ERROR_CODES.AI_INPUT_TOO_LARGE]: 413,
};

const RETRYABLE_CODES = new Set([
  AI_ERROR_CODES.AI_TIMEOUT,
  AI_ERROR_CODES.AI_RATE_LIMITED,
  AI_ERROR_CODES.AI_PROVIDER_ERROR,
]);

const DEFAULT_MESSAGES = {
  [AI_ERROR_CODES.AI_DISABLED]:
    'AI features are not configured on this server. Everything else still works.',
  [AI_ERROR_CODES.AI_TIMEOUT]: 'The AI request took too long. Please try again.',
  [AI_ERROR_CODES.AI_RATE_LIMITED]:
    'The AI provider is rate limiting requests. Please try again shortly.',
  [AI_ERROR_CODES.AI_PROVIDER_ERROR]:
    'The AI provider could not complete this request. Please try again.',
  [AI_ERROR_CODES.AI_REFUSED]: 'The AI declined to complete this request.',
  [AI_ERROR_CODES.AI_INCOMPLETE]:
    'The AI response was cut short before it could be completed. Please try again.',
  [AI_ERROR_CODES.AI_INVALID_OUTPUT]:
    'The AI returned a result that failed validation and was discarded.',
  [AI_ERROR_CODES.AI_INPUT_TOO_LARGE]:
    'There is too much content to send to the AI in one request.',
};

/**
 * Builds a serviceError-compatible error carrying an `aiErrorCode` so controllers
 * can return a machine-readable code alongside the message.
 */
const createAiError = (code, message, cause) => {
  const resolvedCode = AI_ERROR_CODES[code] ? code : AI_ERROR_CODES.AI_PROVIDER_ERROR;
  const error = createServiceError(
    AI_ERROR_STATUS[resolvedCode],
    message || DEFAULT_MESSAGES[resolvedCode]
  );

  error.aiErrorCode = resolvedCode;
  error.retryable = RETRYABLE_CODES.has(resolvedCode);

  if (cause) {
    error.cause = cause;
  }

  return error;
};

const isAiError = (error) => Boolean(error && error.aiErrorCode);

module.exports = {
  AI_ERROR_CODES,
  createAiError,
  isAiError,
};
