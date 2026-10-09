export function sendData(res, data, status = 200) {
  res.status(status).json({ data });
}

export function sendMessage(res, status, message) {
  res.status(status).json({ message });
}

export function notFound(_req, res) {
  sendMessage(res, 404, "Not found");
}

export function errorHandler(err, _req, res, _next) {
  const status = Number(err.statusCode) || 500;
  // 5xx messages are hidden unless the thrower marked the message as safe with `expose`.
  const message =
    status >= 500 && !err.expose ? "Internal server error" : err.message || "Request failed";
  if (err.aiErrorCode) {
    res.status(status).json({ message, code: err.aiErrorCode });
    return;
  }
  sendMessage(res, status, message);
}
