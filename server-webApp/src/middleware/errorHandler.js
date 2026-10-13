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
    const failures =
      Array.isArray(err.failures) && err.failures.length > 0 ? { failures: err.failures } : {};
    const aiRun = err.aiRun ? { aiRun: err.aiRun } : {};
    res.status(status).json({ message, code, ...failures, ...aiRun });
    return;
  }
  sendMessage(res, status, message);
}
