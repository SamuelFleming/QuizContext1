import mongoose from "mongoose";
import { AiUsage } from "../models/aiUsage.js";

const FIELDS = [
  "operation",
  "promptVersion",
  "providerMode",
  "model",
  "inputTokens",
  "outputTokens",
  "estimatedCostUsd",
  "status",
  "errorCode",
  "latencyMs",
  "context",
];

// The owner always comes from the trusted X-User-Id, never from the record body.
export async function createAiUsage(userId, record) {
  const doc = { userId };
  for (const field of FIELDS) {
    if (record[field] !== undefined) {
      doc[field] = record[field];
    }
  }
  return AiUsage.create(doc);
}

function emptyTotals() {
  return { calls: 0, inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 };
}

// Current calendar month (UTC) totals per providerMode, plus the five most recent records.
export async function summarizeAiUsage(userId) {
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const owner = new mongoose.Types.ObjectId(userId);

  const grouped = await AiUsage.aggregate([
    { $match: { userId: owner, createdAt: { $gte: periodStart } } },
    {
      $group: {
        _id: "$providerMode",
        calls: { $sum: 1 },
        inputTokens: { $sum: { $ifNull: ["$inputTokens", 0] } },
        outputTokens: { $sum: { $ifNull: ["$outputTokens", 0] } },
        estimatedCostUsd: { $sum: { $ifNull: ["$estimatedCostUsd", 0] } },
      },
    },
  ]);

  const totals = { application: emptyTotals(), user: emptyTotals() };
  for (const { _id, ...values } of grouped) {
    if (totals[_id]) {
      totals[_id] = { ...values, estimatedCostUsd: Number(values.estimatedCostUsd.toFixed(6)) };
    }
  }

  const recent = await AiUsage.find({ userId: owner }).sort({ createdAt: -1 }).limit(5);
  return { periodStart, totals, recent };
}
