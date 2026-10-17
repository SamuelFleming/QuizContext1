import mongoose from "mongoose";
import { CONTEXT_MODES } from "../constants/content.js";
import { AI_ACCESS_MODES } from "../constants/user.js";

// Counts only; the source text itself is never stored on a usage record.
const contextSummarySchema = new mongoose.Schema(
  {
    contextMode: { type: String, enum: CONTEXT_MODES, required: true },
    includedChars: { type: Number, min: 0, required: true },
    sourcesIncluded: { type: Number, min: 0, required: true },
    sourcesTruncated: { type: Number, min: 0, required: true },
    sourcesExcluded: { type: Number, min: 0, required: true },
  },
  { _id: false },
);

const scopeManifestEntrySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["subject", "topic", "document"], required: true },
    id: { type: String, required: true, maxlength: 120 },
    title: { type: String, required: true, maxlength: 200 },
    path: { type: String, required: true, maxlength: 2000 },
    chars: { type: Number, min: 0, required: true },
    status: { type: String, enum: ["included", "truncated", "excluded"], required: true },
  },
  { _id: false },
);

// Operation-specific identifiers and source metadata only. Never prompt/source bodies.
const scopeSchema = new mongoose.Schema(
  {
    subjectId: { type: String, maxlength: 120 },
    topicId: { type: String, maxlength: 120 },
    selectionName: { type: String, maxlength: 120 },
    manifest: { type: [scopeManifestEntrySchema], default: undefined },
    quizId: { type: String, maxlength: 120 },
    attemptId: { type: String, maxlength: 120 },
  },
  { _id: false },
);

// One record per AI operation. Holds no prompt text, key, or key fingerprint.
const aiUsageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    operation: { type: String, required: true, maxlength: 80 },
    promptVersion: { type: String, maxlength: 80, default: null },
    providerMode: { type: String, enum: AI_ACCESS_MODES, required: true },
    model: { type: String, maxlength: 120, default: null },
    inputTokens: { type: Number, min: 0, default: null },
    outputTokens: { type: Number, min: 0, default: null },
    estimatedCostUsd: { type: Number, min: 0, default: null },
    status: { type: String, enum: ["succeeded", "failed"], required: true },
    errorCode: { type: String, maxlength: 40, default: null },
    latencyMs: { type: Number, min: 0, default: null },
    context: { type: contextSummarySchema, default: null },
    inputChars: { type: Number, min: 0, default: null },
    maxOutputTokens: { type: Number, min: 0, default: null },
    scope: { type: scopeSchema, default: null },
    failures: {
      type: [{ type: String, maxlength: 80 }],
      validate: [(value) => value.length <= 20, "failures cannot contain more than 20 entries"],
      default: [],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

aiUsageSchema.index({ userId: 1, createdAt: -1 });

export const AiUsage = mongoose.models.AiUsage || mongoose.model("AiUsage", aiUsageSchema);

export function toAiUsage(doc) {
  const context = doc.context
    ? {
        contextMode: doc.context.contextMode,
        includedChars: doc.context.includedChars,
        sourcesIncluded: doc.context.sourcesIncluded,
        sourcesTruncated: doc.context.sourcesTruncated,
        sourcesExcluded: doc.context.sourcesExcluded,
      }
    : null;
  const scope = doc.scope
    ? {
        ...(doc.scope.subjectId ? { subjectId: doc.scope.subjectId } : {}),
        ...(doc.scope.topicId ? { topicId: doc.scope.topicId } : {}),
        ...(doc.scope.selectionName ? { selectionName: doc.scope.selectionName } : {}),
        ...(doc.scope.manifest
          ? {
              manifest: doc.scope.manifest.map((entry) => ({
                type: entry.type,
                id: entry.id,
                title: entry.title,
                path: entry.path,
                chars: entry.chars,
                status: entry.status,
              })),
            }
          : {}),
        ...(doc.scope.quizId ? { quizId: doc.scope.quizId } : {}),
        ...(doc.scope.attemptId ? { attemptId: doc.scope.attemptId } : {}),
      }
    : null;
  return {
    id: doc._id.toString(),
    operation: doc.operation,
    promptVersion: doc.promptVersion ?? null,
    providerMode: doc.providerMode,
    model: doc.model,
    inputTokens: doc.inputTokens,
    outputTokens: doc.outputTokens,
    estimatedCostUsd: doc.estimatedCostUsd,
    status: doc.status,
    errorCode: doc.errorCode,
    latencyMs: doc.latencyMs,
    context,
    inputChars: doc.inputChars,
    maxOutputTokens: doc.maxOutputTokens,
    scope,
    failures: doc.failures || [],
    createdAt: doc.createdAt,
  };
}
