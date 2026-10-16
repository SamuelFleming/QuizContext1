export const PROFILE_CODES = new Set([
  "AI_KEY_MISSING",
  "AI_LIMIT_REACHED",
  "AI_DISABLED",
  "AI_AUTH_FAILED",
]);

export const CONTEXT_MODES = [
  ["targeted", "Targeted"],
  ["very_strict", "Very Strict"],
  ["loose", "Loose"],
];

export function modeLabel(mode) {
  return CONTEXT_MODES.find(([value]) => value === mode)?.[1] || mode;
}

export function generationErrorText(err) {
  if (err?.code === "CONTEXT_INSUFFICIENT") {
    return "There isn't enough content to quiz yet. Add notes or a document first.";
  }
  return err?.message || "Could not generate a quiz.";
}
