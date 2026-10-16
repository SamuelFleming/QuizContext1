export const components = {
  responses: {
    AiSettings: {
      description: "AI access status",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: { data: { $ref: "#/components/schemas/AiSettings" } },
          },
        },
      },
    },
    AiError: {
      description:
        "Typed AI failure: AI_KEY_MISSING 400, AI_INVALID_OUTPUT 422, AI_RATE_LIMITED or AI_LIMIT_REACHED 429, AI_AUTH_FAILED or AI_PROVIDER_ERROR 502, AI_DISABLED 503, AI_TIMEOUT 504",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: { type: "string" },
              code: {
                type: "string",
                enum: [
                  "AI_DISABLED",
                  "AI_KEY_MISSING",
                  "AI_AUTH_FAILED",
                  "AI_TIMEOUT",
                  "AI_RATE_LIMITED",
                  "AI_LIMIT_REACHED",
                  "AI_PROVIDER_ERROR",
                  "AI_INVALID_OUTPUT",
                ],
              },
            },
          },
        },
      },
    },
    BadRequest: {
      description: "Invalid input",
      content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
    },
    Unauthorized: {
      description: "Missing, invalid, or expired token",
      content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
    },
    NotFound: {
      description: "Not found, or not owned by the signed-in user",
      content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
    },
    TopicDeleted: {
      description: "Topic and descendants deleted",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  deletedTopicIds: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
    Deleted: {
      description: "Deleted",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: { data: { type: "object", properties: { id: { type: "string" } } } },
          },
        },
      },
    },
  },
  securitySchemes: {
    bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
  },
  schemas: {
    ContentInput: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1, maxLength: 120 },
        description: { type: "string", maxLength: 2000, description: "Markdown" },
        notes: { type: "string", maxLength: 50000, description: "Markdown" },
      },
    },
    TopicInput: {
      allOf: [
        { $ref: "#/components/schemas/ContentInput" },
        {
          type: "object",
          required: ["name"],
          properties: { parentTopicId: { type: "string", nullable: true } },
        },
      ],
    },
    Topic: {
      type: "object",
      properties: {
        id: { type: "string" },
        subjectId: { type: "string" },
        parentTopicId: { type: "string", nullable: true },
        name: { type: "string" },
        description: { type: "string" },
        notes: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    ExtractedDocument: {
      type: "object",
      properties: {
        title: { type: "string", description: "Suggested from the file name" },
        content: { type: "string" },
        originalFileName: { type: "string" },
        mimeType: { type: "string", enum: ["text/markdown", "text/plain", "application/pdf"] },
        sizeBytes: { type: "integer" },
      },
    },
    DocumentInput: {
      type: "object",
      required: ["subjectId", "title", "content"],
      properties: {
        subjectId: { type: "string" },
        topicId: { type: "string", nullable: true },
        title: { type: "string", minLength: 1, maxLength: 200 },
        content: { type: "string", minLength: 1, maxLength: 200000 },
        originalFileName: { type: "string", maxLength: 255 },
        mimeType: { type: "string", maxLength: 100 },
        sizeBytes: { type: "integer", minimum: 0 },
      },
    },
    DocumentChanges: {
      type: "object",
      properties: {
        title: { type: "string", minLength: 1, maxLength: 200 },
        content: { type: "string", minLength: 1, maxLength: 200000 },
      },
    },
    DocumentSummary: {
      type: "object",
      properties: {
        id: { type: "string" },
        subjectId: { type: "string" },
        topicId: { type: "string", nullable: true },
        title: { type: "string" },
        originalFileName: { type: "string" },
        mimeType: { type: "string" },
        sizeBytes: { type: "integer" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    Document: {
      allOf: [
        { $ref: "#/components/schemas/DocumentSummary" },
        { type: "object", properties: { content: { type: "string" } } },
      ],
    },
    Subject: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        description: { type: "string" },
        notes: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    Health: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            service: { type: "string", example: "server-webApp" },
            status: { type: "string", example: "ok" },
          },
        },
      },
    },
    Connectivity: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            webApp: { type: "string", enum: ["ok", "failed"] },
            dataApi: { type: "string", enum: ["ok", "failed"] },
            database: { type: "string", enum: ["ok", "failed"] },
          },
        },
      },
    },
    User: {
      type: "object",
      properties: {
        id: { type: "string" },
        email: { type: "string" },
        displayName: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    AiSettings: {
      type: "object",
      properties: {
        aiAccessMode: { type: "string", enum: ["application", "user"] },
        hasUserKey: { type: "boolean" },
        keyUpdatedAt: { type: "string", format: "date-time", nullable: true },
        applicationLimit: { $ref: "#/components/schemas/ApplicationLimit" },
      },
    },
    ApplicationLimit: {
      type: "object",
      description: "Current-month application-key allowance (input + output tokens).",
      properties: {
        monthlyTokenLimit: { type: "integer" },
        usedTokens: { type: "integer" },
        remainingTokens: { type: "integer" },
      },
    },
    AiUsageTotals: {
      type: "object",
      properties: {
        calls: { type: "integer" },
        inputTokens: { type: "integer" },
        outputTokens: { type: "integer" },
        estimatedCostUsd: { type: "number" },
      },
    },
    AiUsage: {
      type: "object",
      properties: {
        id: { type: "string" },
        operation: { type: "string" },
        promptVersion: { type: "string", nullable: true },
        providerMode: { type: "string", enum: ["application", "user"] },
        model: { type: "string", nullable: true },
        inputTokens: { type: "integer", nullable: true },
        outputTokens: { type: "integer", nullable: true },
        estimatedCostUsd: { type: "number", nullable: true },
        status: { type: "string", enum: ["succeeded", "failed"] },
        errorCode: { type: "string", nullable: true },
        latencyMs: { type: "integer", nullable: true },
        context: { $ref: "#/components/schemas/AiUsageContext" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
    AiUsageContext: {
      type: "object",
      nullable: true,
      description: "Counts describing the context package. Never holds source text.",
      properties: {
        contextMode: { type: "string", enum: ["very_strict", "targeted", "loose"] },
        includedChars: { type: "integer" },
        sourcesIncluded: { type: "integer" },
        sourcesTruncated: { type: "integer" },
        sourcesExcluded: { type: "integer" },
      },
    },
    ContextManifestEntry: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["subject", "topic", "document"] },
        id: { type: "string" },
        title: { type: "string" },
        path: { type: "string" },
        chars: { type: "integer" },
        status: { type: "string", enum: ["included", "truncated", "excluded"] },
      },
    },
    ResultsPayload: {
      type: "object",
      description:
        "Evaluated attempt. Includes the learner's response, the correct option or expected answer and criteria, feedback, and source titles. Omits the source snapshot.",
      properties: {
        attempt: {
          type: "object",
          properties: {
            id: { type: "string" },
            quizId: { type: "string" },
            status: { type: "string", enum: ["evaluated"] },
            evaluation: {
              type: "object",
              properties: {
                score: { type: "number" },
                maxScore: { type: "integer" },
                percent: { type: "integer" },
                summary: { type: "string" },
                promptVersion: { type: "string", nullable: true },
                evaluatedAt: { type: "string", format: "date-time" },
              },
            },
            results: { type: "array", items: { type: "object" } },
          },
        },
        quiz: { $ref: "#/components/schemas/QuizStudyView" },
      },
    },
    PlayerPayload: {
      type: "object",
      description: "Attempt plus study-view quiz. Omits answer keys, marking criteria, and the snapshot.",
      properties: {
        attempt: {
          type: "object",
          properties: {
            id: { type: "string" },
            quizId: { type: "string" },
            status: { type: "string", enum: ["in_progress", "submitted", "evaluated", "evaluation_failed"] },
            responses: { type: "array" },
            startedAt: { type: "string", format: "date-time" },
            submittedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        quiz: { $ref: "#/components/schemas/QuizStudyView" },
      },
    },
    QuizStudyQuestion: {
      type: "object",
      properties: {
        id: { type: "string" },
        type: { type: "string", enum: ["multiple_choice", "short_answer"] },
        prompt: { type: "string" },
        options: { type: "array", items: { type: "string" } },
      },
    },
    QuizStudyView: {
      type: "object",
      description: "Client-facing quiz. Omits answer keys, marking criteria, and source snapshot.",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        subjectId: { type: "string" },
        topicId: { type: "string", nullable: true },
        subjectName: { type: "string" },
        topicPath: { type: "string", nullable: true },
        multipleChoiceCount: { type: "integer" },
        shortAnswerCount: { type: "integer" },
        difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
        includeDescendants: { type: "boolean" },
        contextMode: { type: "string", enum: ["very_strict", "targeted", "loose"] },
        promptVersion: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        context: {
          type: "object",
          properties: {
            truncated: { type: "boolean" },
            manifest: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  id: { type: "string" },
                  title: { type: "string" },
                  path: { type: "string" },
                  status: { type: "string", enum: ["included", "truncated", "excluded"] },
                },
              },
            },
          },
        },
        questions: { type: "array", items: { $ref: "#/components/schemas/QuizStudyQuestion" } },
      },
    },
    AuthResult: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
      },
    },
    UserResult: {
      type: "object",
      properties: {
        data: { $ref: "#/components/schemas/User" },
      },
    },
    Error: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};
