import * as attemptService from "../services/attemptService.js";
import { sendData } from "../utils/responses.js";

export async function start(req, res, next) {
  try {
    sendData(res, await attemptService.startAttempt(req.userId, req.params.quizId));
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    sendData(res, await attemptService.listRecentAttempts(req.userId, req.query.limit));
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    sendData(res, await attemptService.getAttempt(req.userId, req.params.attemptId));
  } catch (err) {
    next(err);
  }
}

export async function save(req, res, next) {
  try {
    sendData(res, await attemptService.saveResponses(req.userId, req.params.attemptId, req.body?.responses));
  } catch (err) {
    next(err);
  }
}

export async function submit(req, res, next) {
  try {
    sendData(res, await attemptService.submitAttempt(req.userId, req.params.attemptId, req.body?.responses));
  } catch (err) {
    next(err);
  }
}

export async function evaluate(req, res, next) {
  try {
    sendData(res, await attemptService.retryEvaluation(req.userId, req.params.attemptId));
  } catch (err) {
    next(err);
  }
}
