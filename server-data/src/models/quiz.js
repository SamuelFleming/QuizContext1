import mongoose from "mongoose";
import {
  CONTENT_NAME_MAX,
  CONTEXT_MODES,
  QUIZ_DIFFICULTIES,
  QUIZ_EXPECTED_ANSWER_MAX,
  QUIZ_INSTRUCTIONS_MAX,
  QUIZ_PROMPT_MAX,
  QUIZ_QUESTION_TYPES,
  QUIZ_SNAPSHOT_MAX,
  QUIZ_TOPIC_IDS_MAX,
  QUIZ_TOPIC_PATH_MAX,
} from "../constants/content.js";

const manifestEntrySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["subject", "topic", "document"], required: true },
    id: { type: String, required: true },
    title: { type: String, required: true },
    path: { type: String, required: true },
    chars: { type: Number, min: 0, required: true },
    status: { type: String, enum: ["included", "truncated", "excluded"], required: true },
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: QUIZ_QUESTION_TYPES, required: true },
    prompt: { type: String, required: true, maxlength: QUIZ_PROMPT_MAX },
    concepts: { type: [String], default: [] },
    sourceRefs: { type: [String], default: [] },
    options: { type: [String], default: undefined },
    correctOptionIndex: { type: Number, min: 0, max: 3, default: undefined },
    expectedAnswer: { type: String, maxlength: QUIZ_EXPECTED_ANSWER_MAX, default: undefined },
    markingCriteria: { type: [String], default: undefined },
  },
  { _id: false },
);

const quizSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: CONTENT_NAME_MAX },
    subjectId: { type: String, required: true },
    topicId: { type: String, default: null },
    topicIds: {
      type: [String],
      default: [],
      validate: {
        validator: (ids) =>
          Array.isArray(ids) &&
          ids.length <= QUIZ_TOPIC_IDS_MAX &&
          ids.every((id) => typeof id === "string" && id.length > 0),
      },
    },
    subjectName: { type: String, required: true, maxlength: CONTENT_NAME_MAX },
    topicPath: { type: String, default: null, maxlength: QUIZ_TOPIC_PATH_MAX },
    multipleChoiceCount: { type: Number, min: 0, required: true },
    shortAnswerCount: { type: Number, min: 0, required: true },
    difficulty: { type: String, enum: QUIZ_DIFFICULTIES, required: true },
    includeDescendants: { type: Boolean, required: true },
    contextMode: { type: String, enum: CONTEXT_MODES, required: true },
    quizInstructions: {
      type: String,
      default: null,
      trim: true,
      maxlength: QUIZ_INSTRUCTIONS_MAX,
    },
    promptVersion: { type: String, required: true, maxlength: 80 },
    questions: { type: [questionSchema], required: true },
    sourceManifest: { type: [manifestEntrySchema], required: true },
    sourceSnapshot: { type: String, required: true, maxlength: QUIZ_SNAPSHOT_MAX },
  },
  { timestamps: true },
);

quizSchema.index({ userId: 1, createdAt: -1 });

export const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);

function toQuestion(question) {
  const base = {
    id: question.id,
    type: question.type,
    prompt: question.prompt,
    concepts: question.concepts || [],
    sourceRefs: question.sourceRefs || [],
  };
  if (question.type === "multiple_choice") {
    return {
      ...base,
      options: question.options,
      correctOptionIndex: question.correctOptionIndex,
    };
  }
  return {
    ...base,
    expectedAnswer: question.expectedAnswer,
    markingCriteria: question.markingCriteria || [],
  };
}

export function toQuizSummary(doc, { attemptCount = 0, latestResult = null } = {}) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    title: doc.title,
    subjectName: doc.subjectName,
    topicPath: doc.topicPath || null,
    contextMode: doc.contextMode,
    difficulty: doc.difficulty,
    questionCount: doc.multipleChoiceCount + doc.shortAnswerCount,
    createdAt: doc.createdAt,
    attemptCount,
    latestResult,
  };
}

// Study-history source row: identity, scope names, and question prompts only. Never answer keys.
export function toQuizHistorySource(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    title: doc.title,
    subjectId: doc.subjectId,
    topicId: doc.topicId || null,
    topicIds: Array.isArray(doc.topicIds) ? doc.topicIds : [],
    subjectName: doc.subjectName,
    topicPath: doc.topicPath || null,
    questions: (doc.questions || []).map((question) => ({
      id: question.id,
      prompt: question.prompt,
    })),
    createdAt: doc.createdAt,
  };
}

export function toQuiz(doc) {
  if (!doc) {
    return null;
  }
  return {
    id: doc._id.toString(),
    title: doc.title,
    subjectId: doc.subjectId,
    topicId: doc.topicId || null,
    topicIds: Array.isArray(doc.topicIds) ? doc.topicIds : [],
    subjectName: doc.subjectName,
    topicPath: doc.topicPath || null,
    multipleChoiceCount: doc.multipleChoiceCount,
    shortAnswerCount: doc.shortAnswerCount,
    difficulty: doc.difficulty,
    includeDescendants: doc.includeDescendants,
    contextMode: doc.contextMode,
    quizInstructions: doc.quizInstructions || null,
    promptVersion: doc.promptVersion,
    questions: (doc.questions || []).map(toQuestion),
    sourceManifest: (doc.sourceManifest || []).map((entry) => ({
      type: entry.type,
      id: entry.id,
      title: entry.title,
      path: entry.path,
      chars: entry.chars,
      status: entry.status,
    })),
    sourceSnapshot: doc.sourceSnapshot,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
