import mongoose from "mongoose";
import { AI_ACCESS_MODES } from "../constants/user.js";

// One record per AI operation. Holds no prompt text, key, or key fingerprint.
const aiUsageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    operation: { type: String, required: true, maxlength: 80 },
    providerMode: { type: String, enum: AI_ACCESS_MODES, required: true },
    model: { type: String, maxlength: 120, default: null },
    inputTokens: { type: Number, min: 0, default: null },
    outputTokens: { type: Number, min: 0, default: null },
    estimatedCostUsd: { type: Number, min: 0, default: null },
    status: { type: String, enum: ["succeeded", "failed"], required: true },
    errorCode: { type: String, maxlength: 40, default: null },
    latencyMs: { type: Number, min: 0, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

aiUsageSchema.index({ userId: 1, createdAt: -1 });

export const AiUsage = mongoose.models.AiUsage || mongoose.model("AiUsage", aiUsageSchema);

export function toAiUsage(doc) {
  return {
    id: doc._id.toString(),
    operation: doc.operation,
    providerMode: doc.providerMode,
    model: doc.model,
    inputTokens: doc.inputTokens,
    outputTokens: doc.outputTokens,
    estimatedCostUsd: doc.estimatedCostUsd,
    status: doc.status,
    errorCode: doc.errorCode,
    latencyMs: doc.latencyMs,
    createdAt: doc.createdAt,
  };
}
