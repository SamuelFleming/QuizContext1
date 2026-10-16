import { getAiConfig } from "../config/aiConfig.js";
import { getAiKeyBlob, getAiSettings } from "../services/dataApi/aiSettings.js";
import { decryptSecret } from "../utils/keyCrypto.js";
import { createAiError } from "./aiErrors.js";

function withMode(err, providerMode) {
  err.providerMode = providerMode;
  return err;
}

// Resolves the key for one call. The returned apiKey must stay in memory for that call only.
export async function resolveAiKey(userId) {
  const settings = await getAiSettings(userId);

  if (settings?.aiAccessMode === "user") {
    const blob = await getAiKeyBlob(userId);
    if (!blob) {
      throw withMode(createAiError("AI_KEY_MISSING"), "user");
    }
    try {
      return { apiKey: decryptSecret(blob), providerMode: "user" };
    } catch {
      throw withMode(
        createAiError("AI_KEY_MISSING", "Your stored key could not be read. Please enter it again."),
        "user",
      );
    }
  }

  const config = getAiConfig();
  if (!config.enabled || !config.applicationKey) {
    throw withMode(createAiError("AI_DISABLED"), "application");
  }
  return { apiKey: config.applicationKey, providerMode: "application" };
}
