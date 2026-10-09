import { request } from "./apiClient.js";

export const getMe = () => request("/users/me", { auth: true });
export const updateMe = (payload) =>
  request("/users/me", { method: "PATCH", body: payload, auth: true });
