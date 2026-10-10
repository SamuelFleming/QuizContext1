const keyed = [
  { $ref: "#/components/parameters/InternalApiKey" },
  { $ref: "#/components/parameters/UserId" },
];
const quizId = { in: "path", name: "quizId", required: true, schema: { type: "string" } };

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
      summary: "List the caller's quizzes, newest first (keyed, internal only)",
      description: "Omits questions and the source snapshot. Includes attempt count and the latest evaluated score.",
      parameters: [
        ...keyed,
        { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 100 } },
      ],
      responses: {
        200: { description: "Quiz summaries" },
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
