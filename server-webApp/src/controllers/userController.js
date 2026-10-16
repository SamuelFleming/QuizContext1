import * as userService from "../services/userService.js";
import { sendData } from "../utils/responses.js";

export async function getMe(req, res, next) {
  try {
    sendData(res, await userService.getProfile(req.userId));
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req, res, next) {
  try {
    sendData(res, await userService.updateProfile(req.userId, req.body));
  } catch (err) {
    next(err);
  }
}
