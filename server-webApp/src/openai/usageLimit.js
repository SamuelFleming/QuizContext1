import { getAiConfig } from "../config/aiConfig.js";
import { getAiUsageSummary } from "../services/dataApi/aiUsage.js";

// This month's application-key allowance. User-provided keys are not limited.
export async function getApplicationAllowance(userId, summary) {
  const { appMonthlyTokenLimit } = getAiConfig();
  const current = summary || (await getAiUsageSummary(userId));
  const app = current?.totals?.application || { inputTokens: 0, outputTokens: 0 };
  const usedTokens = app.inputTokens + app.outputTokens;
  return {
    monthlyTokenLimit: appMonthlyTokenLimit,
    usedTokens,
    remainingTokens: Math.max(appMonthlyTokenLimit - usedTokens, 0),
  };
}
