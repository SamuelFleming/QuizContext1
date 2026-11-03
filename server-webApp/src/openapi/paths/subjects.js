const auth = [{ bearerAuth: [] }];
const subjectId = { in: "path", name: "subjectId", required: true, schema: { type: "string" } };

const subjectResult = {
  content: {
    "application/json": {
      schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Subject" } } },
    },
  },
};

const contentBody = {
  required: true,
  content: { "application/json": { schema: { $ref: "#/components/schemas/ContentInput" } } },
};

export const subjectPaths = {
  "/subjects": {
    get: {
      summary: "List the signed-in user's subjects",
      security: auth,
      responses: {
        200: {
          description: "Subjects, most recently updated first",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "array", items: { $ref: "#/components/schemas/Subject" } },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
    post: {
      summary: "Create a subject",
      description: "name is required. Any user id in the body is ignored.",
      security: auth,
      requestBody: contentBody,
      responses: {
        201: { description: "Subject created", ...subjectResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/subjects/{subjectId}": {
    get: {
      summary: "Read a subject",
      security: auth,
      parameters: [subjectId],
      responses: {
        200: { description: "Subject", ...subjectResult },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      summary: "Update a subject's name, description, or notes",
      security: auth,
      parameters: [subjectId],
      requestBody: contentBody,
      responses: {
        200: { description: "Updated subject", ...subjectResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      summary: "Delete a subject",
      description: "Hard delete, including the subject's topics and documents.",
      security: auth,
      parameters: [subjectId],
      responses: {
        200: { $ref: "#/components/responses/Deleted" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/subjects/{subjectId}/history": {
    get: {
      summary: "Subject or topic study history",
      description:
        "Workspace study history for one owned subject, optionally filtered by topicId. recentResults are the latest evaluated attempt per in-scope quiz, newest first — not every attempt and not a quiz list. Topic matching is the 7013 rule (stored topicId or topicIds; whole-subject quizzes are excluded). Default page size is 3. Quiz list stays on GET /quizzes. No activity chart, answer keys, marking criteria, explanations, responses, or snapshots.",
      security: auth,
      parameters: [
        subjectId,
        {
          in: "query",
          name: "topicId",
          schema: { type: "string" },
          description:
            "Limit to one topic that belongs to this subject. Matches a quiz's stored topicId or topicIds; whole-subject quizzes are excluded. Unknown, unowned, or other-subject topic is 404.",
        },
        {
          in: "query",
          name: "page",
          schema: { type: "integer", minimum: 1, default: 1 },
          description: "Recent-results page. Default 1.",
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", minimum: 1, maximum: 100, default: 3 },
          description: "Recent-results page size. Default 3.",
        },
      ],
      responses: {
        200: {
          description: "Scoped counts, stats, and paginated recent results",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      filter: {
                        type: "object",
                        properties: {
                          subjectId: { type: "string" },
                          topicId: { type: "string", nullable: true },
                        },
                      },
                      counts: {
                        type: "object",
                        properties: {
                          quizzesSaved: { type: "integer" },
                          quizzesAttempted: { type: "integer" },
                          evaluatedAttempts: { type: "integer" },
                        },
                      },
                      lastStudiedAt: { type: "string", format: "date-time", nullable: true },
                      stats: {
                        type: "object",
                        properties: {
                          avgPercent: { type: "number", nullable: true },
                          minPercent: { type: "number", nullable: true },
                          maxPercent: { type: "number", nullable: true },
                          meanPercent: { type: "number", nullable: true },
                          lastPercent: { type: "number", nullable: true },
                        },
                      },
                      recentResults: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            attemptId: { type: "string" },
                            quizId: { type: "string" },
                            title: { type: "string" },
                            subjectName: { type: "string" },
                            topicPath: { type: "string", nullable: true },
                            submittedAt: { type: "string", format: "date-time" },
                            score: { type: "number" },
                            maxScore: { type: "number" },
                            percent: { type: "number" },
                          },
                        },
                      },
                      weakestQuestions: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            prompt: { type: "string" },
                            quizId: { type: "string" },
                            quizTitle: { type: "string" },
                            topicPath: { type: "string", nullable: true },
                            averageScore: { type: "number" },
                            timesAnswered: { type: "integer" },
                          },
                        },
                      },
                      weakestTopics: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            subjectName: { type: "string" },
                            topicPath: { type: "string" },
                            averagePercent: { type: "integer" },
                            quizCount: { type: "integer" },
                          },
                        },
                      },
                      pagination: {
                        type: "object",
                        properties: {
                          page: { type: "integer", minimum: 1 },
                          limit: { type: "integer", minimum: 1, maximum: 100 },
                          totalItems: { type: "integer", minimum: 0 },
                          totalPages: { type: "integer", minimum: 0 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
