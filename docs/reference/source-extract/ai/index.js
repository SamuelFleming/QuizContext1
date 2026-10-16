// server/src/services/ai/index.js

const { createStructuredResponse } = require('./aiClient');
const { getPrompt } = require('./promptRegistry');
const { isAiEnabled } = require('./aiConfig');
const { AI_ERROR_CODES, createAiError, isAiError } = require('./aiErrors');

// Registering here keeps prompt modules discoverable from a single entry point.
require('./prompts/opportunityExtractionPrompt');
require('./prompts/evidencePolishPrompt');
require('./prompts/fitEvaluationPrompt');
require('./prompts/coverLetterPrompt');
require('./prompts/skillsDerivationPrompt');
require('./prompts/opportunityComparisonPrompt');

/**
 * Runs one registered prompt end to end: render input, call the provider with a
 * schema-constrained request, then validate the parsed result.
 *
 * @param {Object} params
 * @param {string} params.key - prompt registry key
 * @param {string} params.version - prompt registry version
 * @param {Object} params.input - passed to the prompt's buildInput
 * @returns {Promise<{ data: Object, model: string, promptVersion: string, usage: Object, latencyMs: number }>}
 */
const runPrompt = async ({ key, version, input }) => {
  const prompt = getPrompt(key, version);

  const result = await createStructuredResponse({
    flowClass: prompt.flowClass,
    instructions: prompt.instructions,
    input: prompt.buildInput(input),
    jsonSchema: prompt.jsonSchema,
    maxOutputTokens: prompt.maxOutputTokens,
  });

  return {
    ...result,
    data: prompt.validate(result.data),
    promptVersion: prompt.id,
  };
};

module.exports = {
  AI_ERROR_CODES,
  createAiError,
  isAiEnabled,
  isAiError,
  runPrompt,
};
