// server/src/services/ai/aiConfig.js

// Model identifiers are env-driven so a provider catalogue change never requires a
// code change. See docs/ML-Design/01_openai_provider_spec.md §2.
const DEFAULT_MODELS = {
  extraction: 'gpt-5.6-luna',
  polish: 'gpt-5.6-luna',
  evaluation: 'gpt-5.6-terra',
  generation: 'gpt-5.6-terra',
};

const FLOW_CLASS_ENV_VARS = {
  extraction: 'AI_MODEL_EXTRACTION',
  polish: 'AI_MODEL_POLISH',
  evaluation: 'AI_MODEL_EVALUATION',
  generation: 'AI_MODEL_GENERATION',
};

const readInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getApiKey = () => (process.env.OPENAI_API_KEY || '').trim();

/**
 * AI is only on when it is both switched on and actually configured, so a missing
 * key degrades to a clean AI_DISABLED error instead of a provider auth failure.
 */
const isAiEnabled = () => {
  const flag = (process.env.AI_ENABLED || 'true').trim().toLowerCase();
  const enabled = flag !== 'false' && flag !== '0' && flag !== 'off';

  return enabled && getApiKey().length > 0;
};

const resolveModel = (flowClass) => {
  const envVar = FLOW_CLASS_ENV_VARS[flowClass];
  const configured = envVar ? (process.env[envVar] || '').trim() : '';

  return configured || DEFAULT_MODELS[flowClass] || DEFAULT_MODELS.extraction;
};

const getAiConfig = () => ({
  apiKey: getApiKey(),
  enabled: isAiEnabled(),
  timeoutMs: readInt(process.env.AI_REQUEST_TIMEOUT_MS, 60000),
  maxRetries: readInt(process.env.AI_MAX_RETRIES, 2),
  maxInputChars: readInt(process.env.AI_MAX_INPUT_CHARS, 60000),
});

module.exports = {
  DEFAULT_MODELS,
  getAiConfig,
  isAiEnabled,
  resolveModel,
};
