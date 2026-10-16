import { getExperimentConfig } from "../constants/aiExperiment/baseline.js";

// Character budget for one context package, and the minimum usable amount of source text.
export function getContextConfig() {
  const experiment = getExperimentConfig();
  return {
    maxChars: experiment.contextMaxChars,
    minChars: experiment.contextMinChars,
  };
}
