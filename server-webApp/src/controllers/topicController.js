import * as topicService from "../services/topicService.js";
import { sendData } from "../utils/responses.js";

export async function listForSubject(req, res, next) {
  try {
    sendData(res, await topicService.listTopics(req.userId, req.params.subjectId));
  } catch (err) {
    next(err);
  }
}

export async function createForSubject(req, res, next) {
  try {
    sendData(
      res,
      await topicService.createTopic(req.userId, req.params.subjectId, req.body),
      201,
    );
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    sendData(res, await topicService.getTopic(req.userId, req.params.topicId));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    sendData(res, await topicService.updateTopic(req.userId, req.params.topicId, req.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    sendData(res, await topicService.deleteTopic(req.userId, req.params.topicId));
  } catch (err) {
    next(err);
  }
}
