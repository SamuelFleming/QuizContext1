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
        providerMode: { type: "string", enum: ["application", "user"] },
        model: { type: "string", nullable: true },
        inputTokens: { type: "integer", nullable: true },
        outputTokens: { type: "integer", nullable: true },
        estimatedCostUsd: { type: "number", nullable: true },
        status: { type: "string", enum: ["succeeded", "failed"] },
        errorCode: { type: "string", nullable: true },
        latencyMs: { type: "integer", nullable: true },
        createdAt: { type: "string", format: "date-time" },
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
