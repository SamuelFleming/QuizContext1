// Errors thrown by services and data API calls. The error handler shows the message for
// 4xx, and for 5xx only when `expose` is true.
export function createHttpError(status, message, { expose = true } = {}) {
  const err = new Error(message);
  err.statusCode = status;
  err.expose = expose;
  return err;
}
