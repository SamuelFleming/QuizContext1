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
  const message = status >= 500 ? "Internal server error" : err.message || "Request failed";
  sendMessage(res, status, message);
}
