// server/src/services/ai/structuredOutput.js

const { AI_ERROR_CODES, createAiError } = require('./aiErrors');

// Schema constraint guarantees shape, not truth — every parsed result is re-checked
// here before it can reach a controller. See 01_openai_provider_spec.md §3.

const invalid = (label, detail) =>
  createAiError(
    AI_ERROR_CODES.AI_INVALID_OUTPUT,
    `The AI returned an unusable result (${label}: ${detail}).`
  );

const expectObject = (value, label = 'result') => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw invalid(label, 'expected an object');
  }

  return value;
};

const boundedString = (value, { label = 'text', max = 4000, allowEmpty = true } = {}) => {
  if (value === null || value === undefined) {
    if (!allowEmpty) {
      throw invalid(label, 'missing');
    }

    return '';
  }

  if (typeof value !== 'string') {
    throw invalid(label, 'expected a string');
  }

  const trimmed = value.trim();

  if (!trimmed && !allowEmpty) {
    throw invalid(label, 'empty');
  }

  return trimmed.slice(0, max);
};

/**
 * Normalises a model-returned list of short terms: trims, drops empties, caps length,
 * and removes case-insensitive duplicates while preserving the first-seen casing.
 */
const termArray = (value, { label = 'terms', maxItems = 40, maxLength = 80 } = {}) => {
  if (value === null || value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw invalid(label, 'expected an array');
  }

  const seen = new Set();
  const terms = [];

  for (const entry of value) {
    if (typeof entry !== 'string') {
      continue;
    }

    const trimmed = entry.trim().slice(0, maxLength);

    if (!trimmed) {
      continue;
    }

    const dedupeKey = trimmed.toLowerCase();

    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    terms.push(trimmed);

    if (terms.length >= maxItems) {
      break;
    }
  }

  return terms;
};

const enumValue = (value, allowed, fallback) => {
  if (typeof value === 'string' && allowed.includes(value)) {
    return value;
  }

  return fallback;
};

/**
 * Unwraps an evidence-carrying field: the value plus the source phrase justifying it.
 * A value with no supporting source text is downgraded to `fallback` rather than
 * being allowed to pass as an apparent fact.
 */
const evidencedEnum = (value, allowed, fallback, { label = 'field' } = {}) => {
  if (value === null || value === undefined) {
    return { value: fallback, sourceText: '' };
  }

  const entry = expectObject(value, label);
  const resolved = enumValue(entry.value, allowed, fallback);
  const sourceText = boundedString(entry.sourceText, { label: `${label}.sourceText`, max: 400 });

  if (resolved !== fallback && !sourceText) {
    return { value: fallback, sourceText: '' };
  }

  return { value: resolved, sourceText };
};

module.exports = {
  boundedString,
  enumValue,
  evidencedEnum,
  expectObject,
  invalid,
  termArray,
};
