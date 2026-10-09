import { request } from "./apiClient.js";

export const getAiSettings = () => request("/settings/ai", { auth: true });
export const setAiMode = (aiAccessMode) =>
  request("/settings/ai/mode", { method: "PUT", body: { aiAccessMode }, auth: true });
export const saveAiKey = (apiKey) =>
  request("/settings/ai/key", { method: "PUT", body: { apiKey }, auth: true });
export const removeAiKey = () => request("/settings/ai/key", { method: "DELETE", auth: true });
export const checkAiConnection = () => request("/settings/ai/check", { method: "POST", auth: true });
export const getAiUsage = () => request("/settings/ai/usage", { auth: true });
