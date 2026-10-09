import { Router } from "express";
import { runAiOperation } from "./ai/aiService.js";
import { encryptSecret } from "./ai/keyCrypto.js";
import { getApplicationAllowance } from "./ai/usageLimit.js";
import { requireAuth } from "./auth.js";
import {
  getAiSettings,
  getAiUsageSummary,
  removeAiKeyBlob,
  setAiAccessMode,
  setAiKeyBlob,
} from "./dataClient.js";
import { sendData, sendMessage } from "./http.js";

export const settingsRoutes = Router();

settingsRoutes.use(requireAuth);

settingsRoutes.get("/ai", async (req, res, next) => {
  try {
    const [settings, applicationLimit] = await Promise.all([
      getAiSettings(req.userId),
      getApplicationAllowance(req.userId),
    ]);
    sendData(res, { ...settings, applicationLimit });
  } catch (err) {
    next(err);
  }
});

settingsRoutes.get("/ai/usage", async (req, res, next) => {
  try {
    const summary = await getAiUsageSummary(req.userId);
    const applicationLimit = await getApplicationAllowance(req.userId, summary);
    sendData(res, { ...summary, applicationLimit });
  } catch (err) {
    next(err);
  }
});

settingsRoutes.put("/ai/mode", async (req, res, next) => {
  try {
    const mode = req.body?.aiAccessMode;
    if (mode !== "application" && mode !== "user") {
      sendMessage(res, 400, "Choose application or user access");
      return;
    }
    sendData(res, await setAiAccessMode(req.userId, mode));
  } catch (err) {
    next(err);
  }
});

// The plaintext key is encrypted here and never logged, stored in clear, or echoed back.
settingsRoutes.put("/ai/key", async (req, res, next) => {
  try {
    const apiKey = typeof req.body?.apiKey === "string" ? req.body.apiKey.trim() : "";
    if (!apiKey.startsWith("sk-") || apiKey.length < 20 || apiKey.length > 300) {
      sendMessage(res, 400, "That does not look like an OpenAI API key");
      return;
    }
    const blob = encryptSecret(apiKey);
    sendData(res, await setAiKeyBlob(req.userId, blob));
  } catch (err) {
    next(err);
  }
});

settingsRoutes.delete("/ai/key", async (req, res, next) => {
  try {
    sendData(res, await removeAiKeyBlob(req.userId));
  } catch (err) {
    next(err);
  }
});

const CHECK_SCHEMA = {
  name: "connectivity_check",
  schema: {
    type: "object",
    properties: { ok: { type: "boolean" } },
    required: ["ok"],
    additionalProperties: false,
  },
};

// A tiny fixed prompt that proves the resolved key can complete a structured call.
settingsRoutes.post("/ai/check", async (req, res, next) => {
  try {
    const result = await runAiOperation({
      userId: req.userId,
      operation: "connectivity_check",
      instructions: 'Return the JSON object {"ok": true}.',
      input: "Connectivity check.",
      jsonSchema: CHECK_SCHEMA,
      validate: (data) => data?.ok === true,
      maxOutputTokens: 64,
    });
    sendData(res, {
      ok: true,
      providerMode: result.providerMode,
      model: result.model,
      latencyMs: result.latencyMs,
    });
  } catch (err) {
    next(err);
  }
});
