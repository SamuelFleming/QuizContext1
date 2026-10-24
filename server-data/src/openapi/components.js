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
    BadRequest: {
      description: "Invalid input",
      content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
    },
    Unauthorized: {
      description: "Missing or wrong internal API key, or missing/invalid X-User-Id",
      content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
    },
    NotFound: {
      description: "Not found",
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
  parameters: {
    InternalApiKey: {
      in: "header",
      name: "X-Internal-Api-Key",
      required: true,
      schema: { type: "string" },
    },
    UserId: {
      in: "header",
      name: "X-User-Id",
      required: true,
      schema: { type: "string" },
      description: "User id derived by the business API from a verified JWT.",
    },
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
        hasDescription: { type: "boolean" },
        hasNotes: { type: "boolean" },
        documentCount: { type: "integer", description: "Documents on this topic only" },
        contentComplete: {
          type: "boolean",
          description:
            "Own notes are non-empty after trim, or documentCount is at least 1. Child content does not count.",
        },
        ownContentChars: {
          type: "integer",
          description:
            "Character length of own notes (as stored) plus content lengths of documents on this topic only. Description excluded.",
        },
        subtreeContentChars: {
          type: "integer",
          description:
            "ownContentChars plus the same measure for every nested descendant topic. Equals ownContentChars when there are no descendants.",
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
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
        hasDescription: { type: "boolean" },
        hasNotes: { type: "boolean" },
        documentCount: { type: "integer", description: "Documents attached to the subject itself (no topic)" },
        contentComplete: {
          type: "boolean",
          description:
            "Own notes are non-empty after trim, or documentCount is at least 1. Topic content does not count.",
        },
        topicCount: { type: "integer" },
        contentCompleteTopicCount: { type: "integer" },
        ownContentChars: {
          type: "integer",
          description:
            "Character length of subject notes (as stored) plus content lengths of subject-level documents (topicId null). Description excluded.",
        },
        subtreeContentChars: {
          type: "integer",
          description:
            "ownContentChars plus the same measure for every topic under this subject. Equals ownContentChars when there are no topics.",
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    QuizInput: {
      type: "object",
      required: [
        "title",
        "subjectId",
        "subjectName",
        "multipleChoiceCount",
        "shortAnswerCount",
        "difficulty",
        "includeDescendants",
        "contextMode",
        "promptVersion",
        "questions",
        "sourceManifest",
        "sourceSnapshot",
      ],
      properties: {
        title: { type: "string", minLength: 1, maxLength: 120 },
        subjectId: { type: "string" },
        topicId: { type: "string", nullable: true, description: "Null when topicIds is non-empty." },
        topicIds: {
          type: "array",
          maxItems: 30,
          items: { type: "string" },
          description:
            "Explicit topic set, in request order. Omit or send an empty list for a whole-subject or single-topic quiz. Do not send together with topicId.",
        },
        subjectName: { type: "string" },
        topicPath: {
          type: "string",
          nullable: true,
          maxLength: 2000,
          description: "Selected topic names for a topicIds quiz, truncated to 2000 characters. Hierarchical path for a single topicId.",
        },
        multipleChoiceCount: { type: "integer", minimum: 0 },
        shortAnswerCount: { type: "integer", minimum: 0 },
        difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
        includeDescendants: { type: "boolean" },
        contextMode: { type: "string", enum: ["very_strict", "targeted", "loose"] },
        quizInstructions: {
          type: "string",
          nullable: true,
          maxLength: 2000,
          description: "Trimmed learner preferences used for generation, or null.",
        },
        promptVersion: { type: "string" },
        questions: { type: "array", items: { $ref: "#/components/schemas/QuizQuestion" } },
        sourceManifest: { type: "array", items: { $ref: "#/components/schemas/ContextManifestEntry" } },
        sourceSnapshot: {
          type: "string",
          maxLength: 250000,
          description: "Frozen labelled context text used for later evaluation (max 250000).",
        },
      },
    },
    QuizQuestion: {
      type: "object",
      properties: {
        id: { type: "string" },
        type: { type: "string", enum: ["multiple_choice", "short_answer"] },
        prompt: { type: "string" },
        concepts: { type: "array", items: { type: "string" } },
        sourceRefs: { type: "array", items: { type: "string" } },
        options: { type: "array", items: { type: "string" } },
        correctOptionIndex: { type: "integer", minimum: 0, maximum: 3 },
        expectedAnswer: { type: "string" },
        markingCriteria: { type: "array", items: { type: "string" } },
      },
    },
    Quiz: {
      allOf: [
        { $ref: "#/components/schemas/QuizInput" },
        {
          type: "object",
          properties: {
            id: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      ],
    },
    QuizSummary: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        subjectName: { type: "string" },
        topicPath: { type: "string", nullable: true },
        contextMode: { type: "string", enum: ["very_strict", "targeted", "loose"] },
        difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
        questionCount: { type: "integer", minimum: 1, maximum: 20 },
        createdAt: { type: "string", format: "date-time" },
        attemptCount: { type: "integer", minimum: 0 },
        latestResult: {
          type: "object",
          nullable: true,
          properties: {
            score: { type: "number" },
            maxScore: { type: "number" },
            percent: { type: "number" },
          },
        },
      },
    },
    QuizListResult: {
      type: "object",
      properties: {
        items: { type: "array", items: { $ref: "#/components/schemas/QuizSummary" } },
        pagination: { $ref: "#/components/schemas/QuizPagination" },
      },
    },
    QuizPagination: {
      type: "object",
      properties: {
        page: { type: "integer", minimum: 1 },
        limit: { type: "integer", minimum: 1, maximum: 100 },
        totalItems: { type: "integer", minimum: 0 },
        totalPages: { type: "integer", minimum: 0 },
      },
    },
    StudyHistoryFilter: {
      type: "object",
      properties: {
        subjectId: { type: "string", nullable: true },
        topicId: { type: "string", nullable: true },
        quizId: { type: "string", nullable: true },
      },
    },
    StudyHistoryRow: {
      type: "object",
      properties: {
        attemptId: { type: "string" },
        quizId: { type: "string" },
        title: { type: "string" },
        subjectName: { type: "string" },
        topicPath: { type: "string", nullable: true },
        submittedAt: { type: "string", format: "date-time", nullable: true },
        score: { type: "number", nullable: true },
        maxScore: { type: "number", nullable: true },
        percent: { type: "number", nullable: true },
      },
    },
    StudyHistoryStats: {
      type: "object",
      description:
        "Filter-wide, not page-wide. avgPercent is the rounded mean of latest-per-quiz percents when quizId is omitted. avgLastNPercent is the rounded mean of the last ≤n attempt percents when quizId is set. min/max/last stay stored; meanPercent is rounded.",
      properties: {
        quizzesSaved: { type: "integer", minimum: 0 },
        quizzesAttempted: { type: "integer", minimum: 0 },
        evaluatedAttempts: { type: "integer", minimum: 0 },
        lastStudiedAt: { type: "string", format: "date-time", nullable: true },
        avgPercent: { type: "integer", nullable: true },
        avgLastNPercent: { type: "integer", nullable: true },
        minPercent: { type: "number", nullable: true },
        maxPercent: { type: "number", nullable: true },
        meanPercent: { type: "integer", nullable: true },
        lastPercent: { type: "number", nullable: true },
      },
    },
    StudyHistoryWeakestQuestion: {
      type: "object",
      properties: {
        prompt: { type: "string" },
        quizId: { type: "string" },
        quizTitle: { type: "string" },
        subjectName: { type: "string" },
        topicPath: { type: "string", nullable: true },
        averageScore: { type: "number" },
        timesAnswered: { type: "integer", minimum: 0 },
        attemptId: { type: "string" },
      },
    },
    StudyHistoryWeakestTopic: {
      type: "object",
      properties: {
        subjectName: { type: "string" },
        topicPath: { type: "string" },
        averagePercent: { type: "integer" },
        quizCount: { type: "integer", minimum: 0 },
      },
    },
    StudyHistoryActivity: {
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
              count: { type: "integer", minimum: 0 },
            },
          },
        },
      },
    },
    StudyHistoryResult: {
      type: "object",
      properties: {
        filter: { $ref: "#/components/schemas/StudyHistoryFilter" },
        items: { type: "array", items: { $ref: "#/components/schemas/StudyHistoryRow" } },
        pagination: { $ref: "#/components/schemas/QuizPagination" },
        stats: { $ref: "#/components/schemas/StudyHistoryStats" },
        attemptSeries: { type: "array", items: { type: "number" } },
        weakestQuestions: {
          type: "array",
          items: { $ref: "#/components/schemas/StudyHistoryWeakestQuestion" },
        },
        weakestTopics: {
          type: "array",
          items: { $ref: "#/components/schemas/StudyHistoryWeakestTopic" },
        },
        activity: { $ref: "#/components/schemas/StudyHistoryActivity" },
      },
    },
    Attempt: {
      type: "object",
      properties: {
        id: { type: "string" },
        quizId: { type: "string" },
        status: { type: "string", enum: ["in_progress", "submitted", "evaluated", "evaluation_failed"] },
        responses: {
          type: "array",
          items: {
            type: "object",
            properties: {
              questionId: { type: "string" },
              selectedOptionIndex: { type: "integer", nullable: true },
              text: { type: "string" },
            },
          },
        },
        startedAt: { type: "string", format: "date-time" },
        submittedAt: { type: "string", format: "date-time", nullable: true },
        evaluation: { nullable: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
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
    Health: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            service: { type: "string", example: "server-data" },
            status: { type: "string", example: "ok" },
          },
        },
      },
    },
    DatabaseStatus: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            database: { type: "string", enum: ["ok", "failed"] },
          },
        },
      },
    },
    Error: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
    PublicUser: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            displayName: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    AiSettings: {
      type: "object",
      properties: {
        aiAccessMode: { type: "string", enum: ["application", "user"] },
        hasUserKey: { type: "boolean" },
        keyUpdatedAt: { type: "string", format: "date-time", nullable: true },
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
        inputChars: { type: "integer", nullable: true },
        maxOutputTokens: { type: "integer", nullable: true },
        scope: { $ref: "#/components/schemas/AiUsageScope" },
        failures: {
          type: "array",
          maxItems: 20,
          items: { type: "string", maxLength: 80 },
        },
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
        multipleChoiceCount: {
          type: "integer",
          nullable: true,
          minimum: 0,
          description:
            "Quiz multiple-choice total for quiz_generation (requested) or answer_evaluation (stored on the quiz). Null when unknown or not applicable.",
        },
        shortAnswerCount: {
          type: "integer",
          nullable: true,
          minimum: 0,
          description:
            "Quiz short-answer total for quiz_generation (requested) or answer_evaluation (stored on the quiz). Null when unknown or not applicable.",
        },
        shortAnswerAiCount: {
          type: "integer",
          nullable: true,
          minimum: 0,
          description:
            "On answer_evaluation only: number of non-blank short answers sent to the model. Null on other operations and on pre-8001 rows. Distinct from shortAnswerCount.",
        },
      },
    },
    AiUsageScope: {
      type: "object",
      nullable: true,
      description:
        "Operation identifiers and manifest metadata only. Never holds prompt instructions, source bodies, or answer material.",
      properties: {
        subjectId: { type: "string" },
        topicId: { type: "string" },
        selectionName: { type: "string" },
        manifest: {
          type: "array",
          items: { $ref: "#/components/schemas/ContextManifestEntry" },
        },
        quizId: { type: "string" },
        attemptId: { type: "string" },
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
    AiUsageSummary: {
      type: "object",
      properties: {
        periodStart: { type: "string", format: "date-time" },
        totals: {
          type: "object",
          properties: {
            application: { $ref: "#/components/schemas/AiUsageTotals" },
            user: { $ref: "#/components/schemas/AiUsageTotals" },
          },
        },
        recent: { type: "array", items: { $ref: "#/components/schemas/AiUsage" } },
        pagination: { $ref: "#/components/schemas/Pagination" },
      },
    },
    Pagination: {
      type: "object",
      properties: {
        page: { type: "integer", minimum: 1 },
        limit: { type: "integer", minimum: 1 },
        totalItems: { type: "integer", minimum: 0 },
        totalPages: { type: "integer", minimum: 0 },
      },
    },
    EncryptedKeyBlob: {
      type: "object",
      required: ["ciphertext", "iv", "authTag", "keyVersion"],
      properties: {
        ciphertext: { type: "string", description: "base64" },
        iv: { type: "string", description: "base64, 12 bytes" },
        authTag: { type: "string", description: "base64" },
        keyVersion: { type: "integer" },
      },
    },
    AuthUser: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            displayName: { type: "string" },
            passwordHash: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
};
