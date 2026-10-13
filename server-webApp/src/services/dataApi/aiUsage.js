import { userScopedRequest } from "./client.js";

export const createAiUsage = (userId, record) =>
  userScopedRequest(userId, "/ai-usage", { method: "POST", body: record });

export const getAiUsageSummary = (userId, { page = 1, limit = 5 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return userScopedRequest(userId, `/ai-usage/summary?${params}`);
};
