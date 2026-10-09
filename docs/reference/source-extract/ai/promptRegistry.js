// server/src/services/ai/promptRegistry.js

// Prompts live in source, never in the database (05_data_model.md). AiRun.promptVersion
// stores the `key@version` reference produced here.

const registry = new Map();

const registryId = (key, version) => `${key}@${version}`;

/**
 * @param {Object} prompt
 * @param {string} prompt.key - stable flow identifier, e.g. "opportunity_extract"
 * @param {string} prompt.version - bump whenever instructions or schema change behaviour
 * @param {string} prompt.flowClass - extraction | polish | evaluation | generation
 * @param {string} prompt.instructions - static system/developer message
 * @param {(input: Object) => string} prompt.buildInput - renders the user message
 * @param {{ name: string, schema: Object }} prompt.jsonSchema
 * @param {number} [prompt.maxOutputTokens]
 */
const registerPrompt = (prompt) => {
  const id = registryId(prompt.key, prompt.version);

  if (registry.has(id)) {
    throw new Error(`Prompt ${id} is already registered`);
  }

  registry.set(id, { ...prompt, id });
  return registry.get(id);
};

const getPrompt = (key, version) => {
  const prompt = registry.get(registryId(key, version));

  if (!prompt) {
    throw new Error(`Prompt ${registryId(key, version)} is not registered`);
  }

  return prompt;
};

const listPrompts = () => Array.from(registry.values());

module.exports = {
  getPrompt,
  listPrompts,
  registerPrompt,
};
