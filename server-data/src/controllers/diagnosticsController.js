import { pingDatabase } from "../config/db.js";
import { sendData } from "../utils/responses.js";

export function getHealth(_req, res) {
  sendData(res, { service: "server-data", status: "ok" });
}

export async function getDatabaseStatus(_req, res, next) {
  try {
    const reachable = await pingDatabase(process.env.MONGODB_URI);
    sendData(res, { database: reachable ? "ok" : "failed" });
  } catch (err) {
    next(err);
  }
}
