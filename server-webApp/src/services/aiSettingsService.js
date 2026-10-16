import { AI_ACCESS_MODES } from "../constants/aiAccessModes.js";
import { runAiOperation } from "../openai/aiService.js";
import { getApplicationAllowance } from "../openai/usageLimit.js";
import { createHttpError } from "../utils/httpError.js";
import { encryptSecret } from "../utils/keyCrypto.js";
import {
  getAiSettings,
  removeAiKeyBlob,
  setAiAccessMode,
  setAiKeyBlob,
} from "./dataApi/aiSettings.js";
import { getAiUsageSummary } from "./dataApi/aiUsage.js";

const CHECK_SCHEMA = {
  name: "connectivity_check",
  schema: {
    type: "object",
    properties: { ok: { type: "boolean" } },
    required: ["ok"],
    additionalProperties: false,
  },
};

export async function getStatus(userId) {
  const [settings, applicationLimit] = await Promise.all([
    getAiSettings(userId),
    getApplicationAllowance(userId),
  ]);
  return { ...settings, applicationLimit };
}

export async function getUsage(userId) {
  const summary = await getAiUsageSummary(userId);
  const applicationLimit = await getApplicationAllowance(userId, summary);
  return { ...summary, applicationLimit };
}

export async function setAccessMode(userId, mode) {
  if (!AI_ACCESS_MODES.includes(mode)) {
    throw createHttpError(400, "Choose application or user access");
  }
  return setAiAccessMode(userId, mode);
}

// The plaintext key is encrypted here and never logged, stored in clear, or echoed back.
export async function saveUserKey(userId, rawKey) {
  const apiKey = typeof rawKey === "string" ? rawKey.trim() : "";
  if (!apiKey.startsWith("sk-") || apiKey.length < 20 || apiKey.length > 300) {
    throw createHttpError(400, "That does not look like an OpenAI API key");
  }
  return setAiKeyBlob(userId, encryptSecret(apiKey));
}

export function removeUserKey(userId) {
  return removeAiKeyBlob(userId);
}

// A tiny fixed prompt that proves the resolved key can complete a structured call.
export async function runConnectivityCheck(userId) {
  const result = await runAiOperation({
    userId,
    operation: "connectivity_check",
    instructions: 'Return the JSON object {"ok": true}.',
    input: "Connectivity check.",
    jsonSchema: CHECK_SCHEMA,
    validate: (data) => data?.ok === true,
    maxOutputTokens: 64,
  });
  return {
    ok: true,
    providerMode: result.providerMode,
    model: result.model,
    latencyMs: result.latencyMs,
  };
}
