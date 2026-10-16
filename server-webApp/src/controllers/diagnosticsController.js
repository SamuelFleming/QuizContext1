import * as diagnosticsService from "../services/diagnosticsService.js";
import { sendData } from "../utils/responses.js";

export function getHealth(_req, res) {
  sendData(res, { service: "server-webApp", status: "ok" });
}

export async function getConnectivity(_req, res, next) {
  try {
    sendData(res, await diagnosticsService.getConnectivity());
  } catch (err) {
    next(err);
  }
}
