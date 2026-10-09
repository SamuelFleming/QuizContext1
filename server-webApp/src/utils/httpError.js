// Errors thrown by services and data API calls. The error handler shows the message for
// 4xx, and for 5xx only when `expose` is true. `errorCode` is returned to the client as `code`.
export function createHttpError(status, message, { expose = true, errorCode } = {}) {
  const err = new Error(message);
  err.statusCode = status;
  err.expose = expose;
  if (errorCode) {
    err.errorCode = errorCode;
  }
  return err;
}
