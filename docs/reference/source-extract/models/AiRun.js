// server/src/models/AiRun.js

const mongoose = require('mongoose');

// Evolutionary list — extend as new AI usages land (05_data_model.md).
const AI_RUN_TYPES = [
  'experience_polish',
  'activity_polish',
  'journal_to_activity',
  'opportunity_extract',
  'fit_evaluation',
  'cover_letter_generation',
  'opportunity_compare',
  'resume_summary_generation',
  'skills_derivation',
  'other',
];

const AI_RUN_TARGET_TYPES = [
  'experience',
  'activity',
  'opportunity',
  'document',
  'journal_entry',
  'core_context',
  'none',
];

// Execution and review are separate lifecycles: a run can succeed technically and
// still be rejected by the user, and the two must not overwrite each other.
const AI_RUN_EXECUTION_STATUSES = [
  'requested',
  'completed',
  'failed',
  'refused',
  'incomplete',
];

const AI_RUN_REVIEW_STATUSES = [
  'not_required',
  'pending',
  'accepted',
  'accepted_with_edits',
  'rejected',
];

const AiRunSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    type: {
      type: String,
      enum: AI_RUN_TYPES,
      required: [true, 'AI run type is required'],
    },
    targetEntityType: {
      type: String,
      enum: AI_RUN_TARGET_TYPES,
      default: 'none',
    },
    targetEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      default: null,
    },
    // A short, non-sensitive description of what was sent — not the prompt or the
    // user's evidence, which stay in their source records.
    inputSummary: {
      type: String,
      default: '',
      trim: true,
    },
    promptVersion: {
      type: String,
      default: '',
    },
    model: {
      type: String,
      default: '',
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    executionStatus: {
      type: String,
      enum: AI_RUN_EXECUTION_STATUSES,
      default: 'requested',
    },
    reviewStatus: {
      type: String,
      enum: AI_RUN_REVIEW_STATUSES,
      default: 'not_required',
    },
    errorCode: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    inputTokens: {
      type: Number,
      default: null,
    },
    outputTokens: {
      type: Number,
      default: null,
    },
    latencyMs: {
      type: Number,
      default: null,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

AiRunSchema.index({ userId: 1, createdAt: -1 });
AiRunSchema.index({ targetEntityType: 1, targetEntityId: 1 });
AiRunSchema.index({ opportunityId: 1 });

AiRunSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.userId;
    return ret;
  },
});

module.exports = mongoose.model('AiRun', AiRunSchema);
module.exports.AI_RUN_TYPES = AI_RUN_TYPES;
module.exports.AI_RUN_TARGET_TYPES = AI_RUN_TARGET_TYPES;
module.exports.AI_RUN_EXECUTION_STATUSES = AI_RUN_EXECUTION_STATUSES;
module.exports.AI_RUN_REVIEW_STATUSES = AI_RUN_REVIEW_STATUSES;
