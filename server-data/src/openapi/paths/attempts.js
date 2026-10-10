const keyed = [
  { $ref: "#/components/parameters/InternalApiKey" },
  { $ref: "#/components/parameters/UserId" },
];
const attemptId = { in: "path", name: "attemptId", required: true, schema: { type: "string" } };
const attemptResult = {
  content: {
    "application/json": {
      schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Attempt" } } },
    },
  },
};

export const attemptPaths = {
  "/attempts": {
    get: {
      summary: "List the caller's recent attempts (keyed, internal only)",
      description: "Newest first. Includes the quiz title, status, dates, and score. Omits responses.",
      parameters: [
        ...keyed,
        { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 100 } },
      ],
      responses: {
        200: { description: "Recent attempts" },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
    post: {
      summary: "Start an attempt, or return the in-progress one (keyed, internal only)",
      description: "The quiz must belong to X-User-Id. An existing in-progress attempt for that quiz is returned instead of creating another.",
      parameters: keyed,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", required: ["quizId"], properties: { quizId: { type: "string" } } },
          },
        },
      },
      responses: {
        200: { description: "Existing in-progress attempt", ...attemptResult },
        201: { description: "Attempt created", ...attemptResult },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/attempts/{attemptId}": {
    get: {
      summary: "Read one of the caller's attempts (keyed, internal only)",
      parameters: [...keyed, attemptId],
      responses: {
        200: { description: "Attempt", ...attemptResult },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      summary: "Save responses while the attempt is in progress (keyed, internal only)",
      parameters: [...keyed, attemptId],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", properties: { responses: { type: "array" } } },
          },
        },
      },
      responses: {
        200: { description: "Updated attempt", ...attemptResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        409: { description: "Attempt is no longer in progress" },
      },
    },
  },
  "/attempts/{attemptId}/submit": {
    post: {
      summary: "Submit an in-progress attempt (keyed, internal only)",
      description: "Saves the final responses and sets status to submitted. Does not evaluate. A second submit returns 409.",
      parameters: [...keyed, attemptId],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", properties: { responses: { type: "array" } } },
          },
        },
      },
      responses: {
        200: { description: "Submitted attempt", ...attemptResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        409: { description: "Already submitted" },
      },
    },
  },
  "/attempts/{attemptId}/evaluation": {
    put: {
      summary: "Store an evaluation or mark evaluation failed (keyed, internal only)",
      description:
        "Allowed only while the attempt is submitted or evaluation_failed. Validates the evaluation shape. Does not score and does not call a model. An evaluated attempt cannot be written again.",
      parameters: [...keyed, attemptId],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["status"],
              properties: {
                status: { type: "string", enum: ["evaluated", "evaluation_failed"] },
                evaluation: { type: "object", nullable: true },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Updated attempt", ...attemptResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        409: { description: "Attempt is not open for evaluation" },
      },
    },
  },
};
