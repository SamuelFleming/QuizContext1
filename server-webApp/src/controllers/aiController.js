import * as descriptionSuggestionService from "../services/descriptionSuggestionService.js";
import { sendData } from "../utils/responses.js";

export async function suggestDescription(req, res, next) {
  try {
    sendData(res, await descriptionSuggestionService.suggestDescription(req.userId, req.body));
  } catch (err) {
    next(err);
  }
}
