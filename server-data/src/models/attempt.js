import mongoose from "mongoose";
import { ATTEMPT_RESPONSE_MAX, ATTEMPT_STATUSES } from "../constants/content.js";

const responseSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    selectedOptionIndex: { type: Number, default: null },
    text: { type: String, maxlength: ATTEMPT_RESPONSE_MAX, default: "" },
  },
  { _id: false },
);

const attemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true, index: true },
    status: { type: String, enum: ATTEMPT_STATUSES, required: true, default: "in_progress" },
    responses: { type: [responseSchema], default: [] },
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date, default: null },
    evaluation: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

attemptSchema.index({ userId: 1, quizId: 1, status: 1 });

export const Attempt = mongoose.models.Attempt || mongoose.model("Attempt", attemptSchema);

export function toAttemptSummary(doc, quizTitle) {
  if (!doc) return null;
  const evaluation = doc.status === "evaluated" ? doc.evaluation : null;
  return {
    id: doc._id.toString(),
    quizId: doc.quizId.toString(),
    ...(quizTitle ? { quizTitle } : {}),
    status: doc.status,
    startedAt: doc.startedAt,
    submittedAt: doc.submittedAt,
    score: evaluation?.score ?? null,
    maxScore: evaluation?.maxScore ?? null,
    percent: evaluation?.percent ?? null,
    createdAt: doc.createdAt,
  };
}

export function toAttempt(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    quizId: doc.quizId.toString(),
    status: doc.status,
    responses: (doc.responses || []).map((response) => ({
      questionId: response.questionId,
      selectedOptionIndex: response.selectedOptionIndex ?? null,
      text: response.text || "",
    })),
    startedAt: doc.startedAt,
    submittedAt: doc.submittedAt,
    evaluation: doc.evaluation ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
