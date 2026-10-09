export function sendData(res, data, status = 200) {
  res.status(status).json({ data });
}

export function sendMessage(res, status, message) {
  res.status(status).json({ message });
}
