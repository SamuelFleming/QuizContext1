import { userScopedRequest } from "./client.js";

export const createAiUsage = (userId, record) =>
  userScopedRequest(userId, "/ai-usage", { method: "POST", body: record });

export const getAiUsageSummary = (userId) => userScopedRequest(userId, "/ai-usage/summary");
