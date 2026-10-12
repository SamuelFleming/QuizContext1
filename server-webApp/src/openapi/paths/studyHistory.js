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
    recentTotal: { type: "integer" },
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
        "One summary computed from saved quizzes and evaluated attempts: counts, recent results (latest evaluated attempt per quiz), activity buckets in UTC (daily for 7 days, weekly starting Monday for 30 or 90), the five weakest topics, the five weakest questions, and the last studied time. In-progress and evaluation_failed attempts are ignored. No answer keys, marking criteria, explanations, or snapshots are returned.",
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
          name: "recent",
          schema: { type: "string", enum: ["1", "3", "5", "all"], default: "5" },
          description: "Rows in recentResults. all returns at most 50; recentTotal gives the uncapped count.",
        },
        {
          in: "query",
          name: "activity",
          schema: { type: "string", enum: ["7", "30", "90"], default: "7" },
          description: "Activity window in days.",
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
