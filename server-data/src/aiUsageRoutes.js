import mongoose from "mongoose";
import { Router } from "express";
import { createAiUsage, summarizeAiUsage } from "./aiUsageRepository.js";
import { sendData, sendMessage } from "./http.js";
import { requireInternalKey, requireUserId } from "./internalAuth.js";
import { toAiUsage } from "./models/aiUsage.js";

export const aiUsageRoutes = Router();

aiUsageRoutes.use(requireInternalKey, requireUserId);

aiUsageRoutes.post("/", async (req, res, next) => {
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
});

aiUsageRoutes.get("/summary", async (req, res, next) => {
  try {
    const { periodStart, totals, recent } = await summarizeAiUsage(req.userId);
    sendData(res, { periodStart, totals, recent: recent.map(toAiUsage) });
  } catch (err) {
    next(err);
  }
});
