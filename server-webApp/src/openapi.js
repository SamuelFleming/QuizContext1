export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "QuizContext business API",
    version: "0.1.0",
    description: "User-facing business API. Documents implemented routes only.",
  },
  paths: {
    "/health": {
      get: {
        summary: "Process health",
        responses: {
          200: {
            description: "The business API process is up",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Health" },
              },
            },
          },
        },
      },
    },
    "/diagnostics/connectivity": {
      get: {
        summary: "Connectivity across the business API, data API, and MongoDB",
        responses: {
          200: {
            description: "Each part is ok or failed. A failed downstream part still returns this body.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Connectivity" },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register a new account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "displayName", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  displayName: { type: "string" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Account created; returns a JWT and the user",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResult" } } },
          },
          400: {
            description: "Invalid input",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          409: {
            description: "Email already registered",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Log in to an existing account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Logged in; returns a JWT and the user",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResult" } } },
          },
          400: {
            description: "Missing email or password",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          401: {
            description: "Invalid email or password (same message for both)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/users/me": {
      get: {
        summary: "Read the signed-in user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "The signed-in user (no password hash)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/UserResult" } } },
          },
          401: {
            description: "Missing, invalid, or expired token",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
      patch: {
        summary: "Update the signed-in user's profile",
        description: "Only displayName can change. Email and password are not editable here.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["displayName"],
                properties: { displayName: { type: "string", minLength: 1, maxLength: 80 } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "The updated user",
            content: { "application/json": { schema: { $ref: "#/components/schemas/UserResult" } } },
          },
          400: {
            description: "Missing or over-long display name",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          401: {
            description: "Missing, invalid, or expired token",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/settings/ai": {
      get: {
        summary: "Read AI access status",
        description: "Shows the access mode and whether a user key is set. Never returns the key.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { $ref: "#/components/responses/AiSettings" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/settings/ai/mode": {
      put: {
        summary: "Choose application-provided or user-provided OpenAI access",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["aiAccessMode"],
                properties: { aiAccessMode: { type: "string", enum: ["application", "user"] } },
              },
            },
          },
        },
        responses: {
          200: { $ref: "#/components/responses/AiSettings" },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/settings/ai/check": {
      post: {
        summary: "Run a small OpenAI call with the resolved key",
        description:
          "Uses the user's key in user mode, or the application key when AI_ENABLED is on. Records one usage entry (operation connectivity_check) on success or failure.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "The call succeeded",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        ok: { type: "boolean" },
                        providerMode: { type: "string", enum: ["application", "user"] },
                        model: { type: "string" },
                        latencyMs: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/AiError" },
          401: { $ref: "#/components/responses/Unauthorized" },
          422: { $ref: "#/components/responses/AiError" },
          429: { $ref: "#/components/responses/AiError" },
          502: { $ref: "#/components/responses/AiError" },
          503: { $ref: "#/components/responses/AiError" },
          504: { $ref: "#/components/responses/AiError" },
        },
      },
    },
    "/settings/ai/usage": {
      get: {
        summary: "This month's AI usage and remaining application allowance",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Usage summary",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
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
                        applicationLimit: { $ref: "#/components/schemas/ApplicationLimit" },
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
    "/settings/ai/key": {
      put: {
        summary: "Add or replace the user's OpenAI API key",
        description:
          "The key is encrypted with AES-256-GCM before storage and is never returned. The response only reports that a key is set.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["apiKey"],
                properties: { apiKey: { type: "string", writeOnly: true } },
              },
            },
          },
        },
        responses: {
          200: { $ref: "#/components/responses/AiSettings" },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          503: {
            description: "Key storage is not configured on the server",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
      delete: {
        summary: "Remove the user's OpenAI API key",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { $ref: "#/components/responses/AiSettings" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
  },
  components: {
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
  },
};
