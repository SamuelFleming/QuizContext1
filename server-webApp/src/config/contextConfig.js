const DEFAULT_MAX_CHARS = 48000;
const DEFAULT_MIN_CHARS = 200;

function readPositive(raw, fallback) {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

// Character budget for one context package, and the minimum usable amount of source text.
export function getContextConfig() {
  return {
    maxChars: readPositive(process.env.AI_CONTEXT_MAX_CHARS, DEFAULT_MAX_CHARS),
    minChars: readPositive(process.env.AI_CONTEXT_MIN_CHARS, DEFAULT_MIN_CHARS),
  };
}
