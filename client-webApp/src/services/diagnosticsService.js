import { request } from "./apiClient.js";

export const getConnectivity = () => request("/diagnostics/connectivity");
