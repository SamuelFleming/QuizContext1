import { sendMessage } from "../utils/responses.js";

export function notFound(_req, res) {
  sendMessage(res, 404, "Not found");
}

export function errorHandler(err, _req, res, _next) {
  const status = Number(err.statusCode) || 500;
  const message = status >= 500 ? "Internal server error" : err.message || "Request failed";
  sendMessage(res, status, message);
}
