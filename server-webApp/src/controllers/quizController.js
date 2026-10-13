import * as quizService from "../services/quizService.js";
import { sendData } from "../utils/responses.js";

export async function create(req, res, next) {
  try {
    sendData(res, await quizService.generateQuiz(req.userId, req.body), 201);
  } catch (err) {
    next(err);
  }
}

export async function preview(req, res, next) {
  try {
    sendData(res, await quizService.previewQuiz(req.userId, req.body));
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    sendData(res, await quizService.getQuiz(req.userId, req.params.quizId));
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    sendData(res, await quizService.listQuizzes(req.userId, req.query.limit));
  } catch (err) {
    next(err);
  }
}

export async function listAttempts(req, res, next) {
  try {
    sendData(res, await quizService.listQuizAttempts(req.userId, req.params.quizId));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    sendData(res, await quizService.deleteQuiz(req.userId, req.params.quizId));
  } catch (err) {
    next(err);
  }
}

export async function exportQuiz(req, res, next) {
  try {
    sendData(res, await quizService.exportQuiz(req.userId, req.params.quizId));
  } catch (err) {
    next(err);
  }
}
