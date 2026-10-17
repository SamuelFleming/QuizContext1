import * as aiSettingsService from "../services/aiSettingsService.js";
import { sendData } from "../utils/responses.js";

export async function getAiStatus(req, res, next) {
  try {
    sendData(res, await aiSettingsService.getStatus(req.userId));
  } catch (err) {
    next(err);
  }
}

export async function getAiUsage(req, res, next) {
  try {
    sendData(res, await aiSettingsService.getUsage(req.userId, req.query));
  } catch (err) {
    next(err);
  }
}

export async function setAiMode(req, res, next) {
  try {
    sendData(res, await aiSettingsService.setAccessMode(req.userId, req.body?.aiAccessMode));
  } catch (err) {
    next(err);
  }
}

export async function saveAiKey(req, res, next) {
  try {
    sendData(res, await aiSettingsService.saveUserKey(req.userId, req.body?.apiKey));
  } catch (err) {
    next(err);
  }
}

export async function removeAiKey(req, res, next) {
  try {
    sendData(res, await aiSettingsService.removeUserKey(req.userId));
  } catch (err) {
    next(err);
  }
}

export async function checkAi(req, res, next) {
  try {
    sendData(res, await aiSettingsService.runConnectivityCheck(req.userId));
  } catch (err) {
    next(err);
  }
}
