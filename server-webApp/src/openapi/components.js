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
        "Typed AI failure: AI_KEY_MISSING or AI_UNKNOWN_MODEL 400, AI_INVALID_OUTPUT 422, AI_RATE_LIMITED or AI_LIMIT_REACHED 429, AI_AUTH_FAILED or AI_PROVIDER_ERROR 502, AI_DISABLED 503, AI_TIMEOUT 504",
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
                  "AI_UNKNOWN_MODEL",
                  "AI_AUTH_FAILED",
                  "AI_TIMEOUT",
                  "AI_RATE_LIMITED",
                  "AI_LIMIT_REACHED",
                  "AI_PROVIDER_ERROR",
                  "AI_INVALID_OUTPUT",
                ],
              },
              failures: {
                type: "array",
                maxItems: 20,
                description: "Present when AI_INVALID_OUTPUT has specific rejection reasons.",
                items: { type: "string", maxLength: 80 },
              },
              aiRun: {
                $ref: "#/components/schemas/AiRun",
                description: "Present when the AI operation was attempted.",
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
    Pagination: {
      type: "object",
      properties: {
        page: { type: "integer", minimum: 1 },
        limit: { type: "integer", minimum: 1, maximum: 25 },
        totalItems: { type: "integer", minimum: 0 },
        totalPages: { type: "integer", minimum: 0 },
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
    AiRun: {
      type: "object",
      description:
        "Safe diagnostics for one AI operation. Never includes prompts, source bodies, credentials, raw output, or answer material.",
      properties: {
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
        inputChars: { type: "integer" },
        maxOutputTokens: { type: "integer" },
        scope: { $ref: "#/components/schemas/AiUsageScope" },
        failures: {
          type: "array",
          maxItems: 20,
          items: { type: "string", maxLength: 80 },
        },
      },
    },
    SourceStatusCounts: {
      type: "object",
      required: ["included", "truncated", "excluded"],
      properties: {
        included: { type: "integer", minimum: 0 },
        truncated: { type: "integer", minimum: 0 },
        excluded: { type: "integer", minimum: 0 },
      },
    },
    QuizPreviewInput: {
      type: "object",
      required: ["subjectId", "multipleChoiceCount", "shortAnswerCount"],
      properties: {
        subjectId: { type: "string" },
        topicId: {
          type: "string",
          nullable: true,
          description: "One topic. Do not send together with topicIds.",
        },
        topicIds: {
          type: "array",
          minItems: 1,
          maxItems: 30,
          items: { type: "string" },
          description:
            "Explicit topics in this subject. Omit both topicId and topicIds for the whole subject.",
        },
        includeDescendants: {
          type: "boolean",
          default: true,
          description: "Used with topicId. Ignored when topicIds is set.",
        },
        multipleChoiceCount: { type: "integer", minimum: 0 },
        shortAnswerCount: { type: "integer", minimum: 0 },
        difficulty: { type: "string", enum: ["easy", "medium", "hard"], default: "medium" },
        contextMode: {
          type: "string",
          enum: ["very_strict", "targeted", "loose"],
          default: "targeted",
        },
        quizInstructions: {
          type: "string",
          nullable: true,
          maxLength: 2000,
          description:
            "Optional learner preferences for how to examine the selected material. Blank values use the unchanged legacy prompt path.",
        },
        model: {
          type: "string",
          nullable: true,
          description:
            "Optional OpenAI model id from the catalogue (GET /ai/models). Omitted or blank uses the active experiment run model. Unknown ids return AI_UNKNOWN_MODEL.",
        },
      },
    },
    QuizGenerateInput: {
      allOf: [
        { $ref: "#/components/schemas/QuizPreviewInput" },
        {
          type: "object",
          properties: {
            title: {
              type: "string",
              nullable: true,
              maxLength: 120,
              description:
                "Optional saved label. Blank or null uses the scope-derived title and the value is never sent to the AI.",
            },
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
        pagination: { $ref: "#/components/schemas/Pagination" },
      },
    },
    AiModel: {
      type: "object",
      required: ["id", "displayName", "priceInputPer1M", "priceOutputPer1M"],
      properties: {
        id: { type: "string", description: "OpenAI model id used in generate/preview requests." },
        displayName: { type: "string" },
        priceInputPer1M: {
          type: "number",
          description: "Catalogue USD per 1M input tokens (estimates only).",
        },
        priceOutputPer1M: {
          type: "number",
          description: "Catalogue USD per 1M output tokens (estimates only).",
        },
      },
    },
    QuizPreview: {
      type: "object",
      properties: {
        selectionName: { type: "string" },
        inputChars: {
          type: "integer",
          minimum: 0,
          description: "Character length of the assembled user input channel (excludes system instructions).",
        },
        maxOutputTokens: { type: "integer", minimum: 1 },
        contextMaxChars: {
          type: "integer",
          minimum: 1,
          description: "Active experiment context character budget (source packing cap).",
        },
        model: {
          type: "string",
          description: "Resolved model id that would be used for generation.",
        },
        estimatedInputTokens: {
          type: "integer",
          minimum: 0,
          nullable: true,
          description:
            "Approximation only: ceil((inputChars + instructions chars) / 4). Not provider billing tokens.",
        },
        estimatedInputCostUsd: {
          type: "number",
          nullable: true,
          description: "Approximation from estimatedInputTokens × catalogue input rate.",
        },
        estimatedOutputCostUsd: {
          type: "number",
          nullable: true,
          description:
            "Upper-bound approximation: maxOutputTokens × catalogue output rate (actual output is usually lower).",
        },
        estimatedTotalCostUsd: {
          type: "number",
          nullable: true,
          description: "estimatedInputCostUsd + estimatedOutputCostUsd (output is a ceiling).",
        },
        context: { $ref: "#/components/schemas/AiUsageContext" },
        sources: {
          type: "object",
          properties: {
            topics: { $ref: "#/components/schemas/SourceStatusCounts" },
            documents: { $ref: "#/components/schemas/SourceStatusCounts" },
          },
        },
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
        topicIds: {
          type: "array",
          items: { type: "string" },
          description: "Explicit topic set. Empty when the quiz used a subject or a single topicId. Missing stored values are returned as an empty list.",
        },
        subjectName: { type: "string" },
        topicPath: { type: "string", nullable: true },
        multipleChoiceCount: { type: "integer" },
        shortAnswerCount: { type: "integer" },
        difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
        includeDescendants: { type: "boolean" },
        contextMode: { type: "string", enum: ["very_strict", "targeted", "loose"] },
        quizInstructions: {
          type: "string",
          nullable: true,
          maxLength: 2000,
          description: "Historical learner preferences used to generate this quiz, or null.",
        },
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
    QuizGenerationResult: {
      allOf: [
        { $ref: "#/components/schemas/QuizStudyView" },
        {
          type: "object",
          required: ["aiRun"],
          properties: { aiRun: { $ref: "#/components/schemas/AiRun" } },
        },
      ],
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
