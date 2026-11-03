import * as studyHistoryService from "../services/studyHistoryService.js";
import * as subjectService from "../services/subjectService.js";
import { sendData } from "../utils/responses.js";

export async function list(req, res, next) {
  try {
    sendData(res, await subjectService.listSubjects(req.userId));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    sendData(res, await subjectService.createSubject(req.userId, req.body), 201);
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    sendData(res, await subjectService.getSubject(req.userId, req.params.subjectId));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    sendData(
      res,
      await subjectService.updateSubject(req.userId, req.params.subjectId, req.body),
    );
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    sendData(res, await subjectService.deleteSubject(req.userId, req.params.subjectId));
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req, res, next) {
  try {
    sendData(
      res,
      await studyHistoryService.getSubjectHistory(req.userId, req.params.subjectId, req.query),
    );
  } catch (err) {
    next(err);
  }
}
