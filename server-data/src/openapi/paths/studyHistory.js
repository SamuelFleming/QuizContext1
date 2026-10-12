const keyed = [
  { $ref: "#/components/parameters/InternalApiKey" },
  { $ref: "#/components/parameters/UserId" },
];

export const studyHistoryPaths = {
  "/study-history": {
    get: {
      summary: "Read the caller's study-history source fields (keyed, internal only)",
      description:
        "Owner-scoped quizzes and evaluated attempts with only the fields the business study-history summary needs: identity, scope names, question prompts, submitted times, and stored scores. No answer keys, marking criteria, explanations, responses, or snapshots. Aggregation happens on server-webApp.",
      parameters: keyed,
      responses: {
        200: {
          description: "Study-history source",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      quizzes: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            title: { type: "string" },
                            subjectId: { type: "string" },
                            topicId: { type: "string", nullable: true },
                            topicIds: { type: "array", items: { type: "string" } },
                            subjectName: { type: "string" },
                            topicPath: { type: "string", nullable: true },
                            questions: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "string" },
                                  prompt: { type: "string" },
                                },
                              },
                            },
                            createdAt: { type: "string", format: "date-time" },
                          },
                        },
                      },
                      attempts: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            quizId: { type: "string" },
                            submittedAt: { type: "string", format: "date-time" },
                            score: { type: "number" },
                            maxScore: { type: "number" },
                            percent: { type: "number" },
                            questionScores: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  questionId: { type: "string" },
                                  score: { type: "number" },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
};
