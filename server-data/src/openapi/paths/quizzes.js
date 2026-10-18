const keyed = [
  { $ref: "#/components/parameters/InternalApiKey" },
  { $ref: "#/components/parameters/UserId" },
];
const quizId = { in: "path", name: "quizId", required: true, schema: { type: "string" } };
const listParameters = [
  { in: "query", name: "page", schema: { type: "integer", minimum: 1, default: 1 } },
  { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 100, default: 25 } },
  {
    in: "query",
    name: "sort",
    schema: {
      type: "string",
      enum: ["newest", "oldest", "question_count_asc", "question_count_desc"],
      default: "newest",
    },
  },
  {
    in: "query",
    name: "subjectId",
    description:
      "Limit to quizzes with this subjectId, including whole-subject quizzes. Combined with topicIds uses AND (subject match plus topic OR).",
    schema: { type: "string" },
  },
  {
    in: "query",
    name: "topicIds",
    description: "Repeat 1-30 unique topic IDs. Uses OR semantics across topicId and topicIds.",
    schema: { type: "array", maxItems: 30, uniqueItems: true, items: { type: "string" } },
    style: "form",
    explode: true,
  },
  { in: "query", name: "questionCount", schema: { type: "integer", minimum: 1, maximum: 20 } },
  { in: "query", name: "multipleChoiceCount", schema: { type: "integer", minimum: 0, maximum: 20 } },
  { in: "query", name: "shortAnswerCount", schema: { type: "integer", minimum: 0, maximum: 20 } },
];

const quizResult = {
  content: {
    "application/json": {
      schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Quiz" } } },
    },
  },
};

export const quizPaths = {
  "/quizzes": {
    post: {
      summary: "Create a generated quiz owned by X-User-Id (keyed, internal only)",
      description:
        "Persists the full quiz including answer keys, marking criteria, and the frozen source snapshot. The owner is always X-User-Id. A userId in the body is ignored. Does not cascade from subject or topic deletes.",
      parameters: keyed,
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/QuizInput" } } },
      },
      responses: {
        201: { description: "Quiz created", ...quizResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
    get: {
      summary: "List the caller's quizzes (keyed, internal only)",
      description:
        "Filters, sorts, counts, and pages owner-scoped quizzes before loading attempt summaries. Optional subjectId includes whole-subject quizzes; with topicIds both filters apply (AND). Omits questions and source snapshots.",
      parameters: [...keyed, ...listParameters],
      responses: {
        200: {
          description: "Paginated quiz summaries",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { data: { $ref: "#/components/schemas/QuizListResult" } },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/quizzes/{quizId}/attempts": {
    get: {
      summary: "List attempts for one of the caller's quizzes (keyed, internal only)",
      description: "Returns id, status, dates, and score. Omits responses and evaluation text.",
      parameters: [...keyed, quizId],
      responses: {
        200: { description: "Attempt summaries" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/quizzes/{quizId}": {
    get: {
      summary: "Read one of the caller's quizzes, including answer keys (keyed, internal only)",
      parameters: [...keyed, quizId],
      responses: {
        200: { description: "Full quiz", ...quizResult },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      summary: "Rename one of the caller's quizzes (keyed, internal only)",
      description: "Changes only the saved title. Questions, attempts, scope, and answer keys stay unchanged.",
      parameters: [...keyed, quizId],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["title"],
              properties: { title: { type: "string", minLength: 1, maxLength: 120 } },
            },
          },
        },
      },
      responses: {
        200: { description: "Renamed quiz", ...quizResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      summary: "Delete one of the caller's quizzes and its attempts (keyed, internal only)",
      description: "Does not delete the subject, topics, or documents.",
      parameters: [...keyed, quizId],
      responses: {
        200: { description: "Deleted" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
