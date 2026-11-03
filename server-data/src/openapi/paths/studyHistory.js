const keyed = [
  { $ref: "#/components/parameters/InternalApiKey" },
  { $ref: "#/components/parameters/UserId" },
];

const listParameters = [
  {
    in: "query",
    name: "subjectId",
    description: "Limit to quizzes with this subjectId, including whole-subject quizzes.",
    schema: { type: "string" },
  },
  {
    in: "query",
    name: "topicId",
    description:
      "Limit to quizzes whose stored topicId or topicIds contain this id. Whole-subject quizzes are excluded.",
    schema: { type: "string" },
  },
  {
    in: "query",
    name: "quizId",
    description: "Limit to one quiz. A filter on both paths, not a row-mode switch.",
    schema: { type: "string" },
  },
  { in: "query", name: "page", schema: { type: "integer", minimum: 1, default: 1 } },
  { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 100, default: 25 } },
  {
    in: "query",
    name: "n",
    description: "Last-N length for avgLastNPercent and attemptSeries.",
    schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
  },
  {
    in: "query",
    name: "include",
    description:
      "Comma-separated optional aggregates over the full filter, not the page: stats, weakestQuestions, weakestTopics, attemptSeries, activity. Omitted flags are not computed.",
    schema: { type: "string" },
  },
  {
    in: "query",
    name: "activity",
    description: "UTC window used only when include contains activity. 7 is daily; 30 and 90 are Monday-start weekly.",
    schema: { type: "integer", enum: [7, 30, 90], default: 7 },
  },
];

const historyResult = {
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: { data: { $ref: "#/components/schemas/StudyHistoryResult" } },
      },
    },
  },
};

export const studyHistoryPaths = {
  "/study-history": {
    get: {
      summary: "Read paginated latest-per-quiz study results (keyed, internal only)",
      description:
        "Owner-scoped evaluated results only. items and totalItems are the latest evaluated attempt per in-scope quiz, newest submittedAt first. Optional include aggregates use the full filter, never the page. No answer keys, marking criteria, explanations, responses, or snapshots.",
      parameters: [...keyed, ...listParameters],
      responses: {
        200: { description: "Paginated latest-per-quiz results", ...historyResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/study-history/attempts": {
    get: {
      summary: "Read paginated evaluated study attempts (keyed, internal only)",
      description:
        "Owner-scoped evaluated attempts only. items and totalItems are every evaluated attempt in the filter, newest submittedAt first. Optional include aggregates use the full filter, never the page. Distinct from player/resume attempt lists. No answer keys, marking criteria, explanations, responses, or snapshots.",
      parameters: [...keyed, ...listParameters],
      responses: {
        200: { description: "Paginated evaluated attempts", ...historyResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
};
