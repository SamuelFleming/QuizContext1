import { getExperimentConfig } from "./aiExperiment/baseline.js";
import { createAiError } from "../openai/aiErrors.js";

// USD per 1M tokens. Estimates only — verify against current OpenAI pricing before spending.
export const AI_MODELS = {
  "gpt-4o-mini": {
    displayName: "GPT-4o mini",
    priceInputPer1M: 0.15,
    priceOutputPer1M: 0.6,
  },
  "gpt-4.1-mini": {
    displayName: "GPT-4.1 mini",
    priceInputPer1M: 0.4,
    priceOutputPer1M: 1.6,
  },
  "gpt-6-luna": {
    displayName: "Luna",
    priceInputPer1M: 0.1,
    priceOutputPer1M: 0.5,
  },
  "gpt-6.1-sol": {
    displayName: "Sol",
    priceInputPer1M: 2,
    priceOutputPer1M: 10,
  },
  "gpt-6-astra": {
    displayName: "Astra",
    priceInputPer1M: 10,
    priceOutputPer1M: 50,
  },
};

function isBlank(value) {
  return value == null || (typeof value === "string" && value.trim() === "");
}

/** Exact match, then longest catalogue key where model equals key or is a dated snapshot prefix. */
export function getModelMeta(modelId) {
  if (typeof modelId !== "string" || modelId.length === 0) {
    return null;
  }
  if (AI_MODELS[modelId]) {
    return AI_MODELS[modelId];
  }
  let bestKey = null;
  for (const key of Object.keys(AI_MODELS)) {
    if (modelId.startsWith(`${key}-`) && (!bestKey || key.length > bestKey.length)) {
      bestKey = key;
    }
  }
  return bestKey ? AI_MODELS[bestKey] : null;
}

/** Public catalogue rows for the model picker (no secrets). */
export function listModels() {
  return Object.entries(AI_MODELS).map(([id, meta]) => ({
    id,
    displayName: meta.displayName,
    priceInputPer1M: meta.priceInputPer1M,
    priceOutputPer1M: meta.priceOutputPer1M,
  }));
}

/**
 * Resolve the model string to send to OpenAI.
 * Absent request → active experiment run model (no catalogue gate).
 * Explicit request → must match the catalogue; return the requested id so dated snapshots work.
 */
export function resolveModel({ requestedModel } = {}) {
  if (isBlank(requestedModel)) {
    return getExperimentConfig().model;
  }
  const id = typeof requestedModel === "string" ? requestedModel.trim() : "";
  if (!getModelMeta(id)) {
    throw createAiError("AI_UNKNOWN_MODEL");
  }
  return id;
}
