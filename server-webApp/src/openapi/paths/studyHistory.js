const summarySchema = {
  type: "object",
  properties: {
    filter: {
      type: "object",
      properties: {
        subjectId: { type: "string", nullable: true },
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
    recentTotal: {
      type: "integer",
      description: "Same as pagination.totalItems (latest-per-quiz rows in the filter).",
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
    activity: {
      type: "object",
      properties: {
        days: { type: "integer", enum: [7, 30, 90] },
        interval: { type: "string", enum: ["day", "week"] },
        buckets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              start: { type: "string", format: "date" },
              count: { type: "integer" },
            },
          },
        },
      },
    },
    weakestTopics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          subjectName: { type: "string" },
          topicPath: { type: "string", description: '"Whole subject" when the quiz had no topic' },
          averagePercent: { type: "integer" },
          quizCount: { type: "integer" },
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
          subjectName: { type: "string" },
          topicPath: { type: "string", nullable: true },
          averageScore: { type: "number" },
          timesAnswered: { type: "integer" },
          attemptId: { type: "string", description: "Attempt holding the most recent answer" },
        },
      },
    },
    lastStudiedAt: { type: "string", format: "date-time", nullable: true },
  },
};

export const studyHistoryPaths = {
  "/study-history": {
    get: {
      summary: "Study history summary",
      description:
        "Dashboard summary from the internal latest-per-quiz study-history read. Counts, activity, and weakest lists are filter-wide; recentResults is one page of latest evaluated attempts per quiz. In-progress and evaluation_failed attempts are ignored. No answer keys, marking criteria, explanations, responses, or snapshots are returned.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "subjectId",
          schema: { type: "string" },
          description: "Limit to one subject. Unknown or another user's subject is 404.",
        },
        {
          in: "query",
          name: "topicId",
          schema: { type: "string" },
          description:
            "Limit to one topic. Requires subjectId. Matches a quiz's stored topicId or topicIds; whole-subject quizzes are excluded.",
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
          schema: { type: "integer", minimum: 1, maximum: 100, default: 5 },
          description:
            "Recent-results page size. Default 5. When omitted, legacy recent maps to this limit.",
        },
        {
          in: "query",
          name: "recent",
          schema: { type: "string", enum: ["1", "3", "5", "all"], default: "5" },
          description:
            "Legacy page-size alias used when limit is omitted: 1, 3, and 5 map to that limit; all maps to 50. If both recent and limit are sent, limit wins. Invalid recent is still 400. recentTotal remains the uncapped latest-per-quiz count.",
        },
        {
          in: "query",
          name: "activity",
          schema: { type: "string", enum: ["7", "30", "90"], default: "7" },
          description: "Activity window in days. 7 is daily; 30 and 90 are Monday-start weekly.",
        },
      ],
      responses: {
        200: {
          description: "Study history summary",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: summarySchema } },
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
