import * as authService from "../services/authService.js";
import { sendData } from "../utils/responses.js";

export async function register(req, res, next) {
  try {
    sendData(res, await authService.register(req.body), 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    sendData(res, await authService.login(req.body));
  } catch (err) {
    next(err);
  }
}
