import { sendMessage } from "../utils/responses.js";

export function notFound(_req, res) {
  sendMessage(res, 404, "Not found");
}

export function errorHandler(err, _req, res, _next) {
  const status = Number(err.statusCode) || 500;
  // 5xx messages are hidden unless the thrower marked the message as safe with `expose`.
  const message =
    status >= 500 && !err.expose ? "Internal server error" : err.message || "Request failed";
  const code = err.aiErrorCode || err.errorCode;
  if (code) {
    res.status(status).json({ message, code });
    return;
  }
  sendMessage(res, status, message);
}
