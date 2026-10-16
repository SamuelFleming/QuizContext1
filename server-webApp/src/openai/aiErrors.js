// Closed set of AI error codes. The response body may add bounded validation failure codes,
// and never includes the key or provider raw text (provider messages can echo part of the key).
const AI_ERRORS = {
  AI_DISABLED: [503, "AI is not enabled for application access on this server. Everything else still works."],
  AI_KEY_MISSING: [400, "Add your OpenAI API key in Profile, or switch to the application key."],
  AI_UNKNOWN_MODEL: [400, "That AI model is not supported."],
  AI_AUTH_FAILED: [502, "OpenAI rejected the API key. Check or replace the key."],
  AI_TIMEOUT: [504, "The AI request took too long. Please try again."],
  AI_RATE_LIMITED: [429, "The AI provider is rate limiting requests. Please try again shortly."],
  AI_LIMIT_REACHED: [429, "You have used this month's application AI allowance. Add your own OpenAI key to continue."],
  AI_PROVIDER_ERROR: [502, "The AI provider could not complete this request. Please try again."],
  AI_INVALID_OUTPUT: [422, "The AI returned a result that failed validation and was discarded."],
};

export function createAiError(code, message) {
  const [status, defaultMessage] = AI_ERRORS[code] || AI_ERRORS.AI_PROVIDER_ERROR;
  const err = new Error(message || defaultMessage);
  err.statusCode = status;
  err.aiErrorCode = AI_ERRORS[code] ? code : "AI_PROVIDER_ERROR";
  err.expose = true;
  return err;
}

export function isAiError(err) {
  return Boolean(err?.aiErrorCode);
}
