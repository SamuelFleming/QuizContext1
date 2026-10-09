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
  },
  securitySchemes: {
    bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
  },
  schemas: {
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
