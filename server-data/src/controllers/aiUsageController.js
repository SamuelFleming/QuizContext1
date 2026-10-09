import mongoose from "mongoose";
import { toAiUsage } from "../models/aiUsage.js";
import { createAiUsage, summarizeAiUsage } from "../repositories/aiUsageRepository.js";
import { sendData, sendMessage } from "../utils/responses.js";

export async function create(req, res, next) {
  try {
    const usage = await createAiUsage(req.userId, req.body || {});
    sendData(res, toAiUsage(usage), 201);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      sendMessage(res, 400, "Invalid usage record");
      return;
    }
    next(err);
  }
}

export async function getSummary(req, res, next) {
  try {
    const { periodStart, totals, recent } = await summarizeAiUsage(req.userId);
    sendData(res, { periodStart, totals, recent: recent.map(toAiUsage) });
  } catch (err) {
    next(err);
  }
}
