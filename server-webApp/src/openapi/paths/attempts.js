const attemptId = { in: "path", name: "attemptId", required: true, schema: { type: "string" } };

const playerResult = {
  content: {
    "application/json": {
      schema: { type: "object", properties: { data: { $ref: "#/components/schemas/PlayerPayload" } } },
    },
  },
};

const attemptReadResult = {
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          data: {
            oneOf: [
              { $ref: "#/components/schemas/PlayerPayload" },
              { $ref: "#/components/schemas/ResultsPayload" },
            ],
          },
        },
      },
    },
  },
};

const responsesBody = {
  required: true,
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          responses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                questionId: { type: "string" },
                selectedOptionIndex: { type: "integer", nullable: true, minimum: 0, maximum: 3 },
                text: { type: "string", maxLength: 2000 },
              },
            },
          },
        },
      },
    },
  },
};

export const attemptPaths = {
  "/attempts": {
    get: {
      summary: "List recent attempts",
      description: "Newest first, with the quiz title, status, dates, and score.",
      security: [{ bearerAuth: [] }],
      parameters: [{ in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 100 } }],
      responses: {
        200: { description: "Recent attempts" },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/attempts/{attemptId}": {
    get: {
      summary: "Read an attempt",
      description:
        "In progress, submitted, and evaluation_failed return the player payload with no answer key. An evaluated attempt returns results: the learner's response, the correct option or expected answer and criteria, feedback, and source titles. The snapshot is never returned.",
      security: [{ bearerAuth: [] }],
      parameters: [attemptId],
      responses: {
        200: { description: "Player payload, or results when the attempt is evaluated", ...attemptReadResult },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      summary: "Save responses while the attempt is in progress",
      security: [{ bearerAuth: [] }],
      parameters: [attemptId],
      requestBody: responsesBody,
      responses: {
        200: { description: "Player payload", ...playerResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        409: { description: "Attempt is no longer in progress" },
      },
    },
  },
  "/attempts/{attemptId}/submit": {
    post: {
      summary: "Submit an attempt and evaluate it",
      description:
        "Saves the final responses, then marks multiple choice from the stored answer and short answers with one AI call against the quiz snapshot. Success returns results. An AI failure keeps the responses, stores no partial evaluation, sets evaluation_failed, and returns the typed AI error. A second submit returns 409.",
      security: [{ bearerAuth: [] }],
      parameters: [attemptId],
      requestBody: responsesBody,
      responses: {
        200: { description: "Evaluated results", ...attemptReadResult },
        400: { description: "Invalid responses, or AI_KEY_MISSING" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        409: { description: "Already submitted" },
        422: { $ref: "#/components/responses/AiError" },
        429: { $ref: "#/components/responses/AiError" },
        502: { $ref: "#/components/responses/AiError" },
        503: { $ref: "#/components/responses/AiError" },
        504: { $ref: "#/components/responses/AiError" },
      },
    },
  },
  "/attempts/{attemptId}/evaluate": {
    post: {
      summary: "Retry evaluation",
      description:
        "Evaluates an attempt that is submitted or evaluation_failed, using the stored quiz snapshot. Returns 409 for an in-progress or already evaluated attempt. AI failures leave the status at evaluation_failed.",
      security: [{ bearerAuth: [] }],
      parameters: [attemptId],
      responses: {
        200: { description: "Evaluated results", ...attemptReadResult },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        409: { description: "Attempt cannot be evaluated" },
        422: { $ref: "#/components/responses/AiError" },
        429: { $ref: "#/components/responses/AiError" },
        502: { $ref: "#/components/responses/AiError" },
        503: { $ref: "#/components/responses/AiError" },
        504: { $ref: "#/components/responses/AiError" },
      },
    },
  },
};
