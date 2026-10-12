import * as studyHistoryService from "../services/studyHistoryService.js";
import { sendData } from "../utils/responses.js";

export async function get(req, res, next) {
  try {
    sendData(res, await studyHistoryService.getStudyHistory(req.userId, req.query));
  } catch (err) {
    next(err);
  }
}
