export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "QuizContext data API",
    version: "0.1.0",
    description: "Persistence API. Documents implemented routes only.",
  },
  paths: {
    "/health": {
      get: {
        summary: "Process health",
        responses: {
          200: {
            description: "The data API process is up",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Health" },
              },
            },
          },
        },
      },
    },
    "/diagnostics/database": {
      get: {
        summary: "MongoDB reachability",
        parameters: [
          {
            in: "header",
            name: "X-Internal-Api-Key",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Database status. failed means MongoDB could not be reached.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DatabaseStatus" },
              },
            },
          },
          401: {
            description: "Missing or wrong internal API key",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/users": {
      post: {
        summary: "Create a user (keyed, internal only)",
        description:
          "The business API supplies an already-hashed password. The response omits passwordHash.",
        parameters: [{ $ref: "#/components/parameters/InternalApiKey" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "passwordHash", "displayName"],
                properties: {
                  email: { type: "string" },
                  passwordHash: { type: "string" },
                  displayName: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PublicUser" },
              },
            },
          },
          400: {
            description: "Missing required fields",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          401: {
            description: "Missing or wrong internal API key",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          409: {
            description: "A user with that email already exists",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/users/by-email": {
      get: {
        summary: "Login lookup by email (keyed, internal only)",
        description:
          "Returns the user including passwordHash so the business API can compare it. Never browser-reachable.",
        parameters: [
          { $ref: "#/components/parameters/InternalApiKey" },
          { in: "query", name: "email", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "User found (includes passwordHash)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthUser" },
              },
            },
          },
          401: {
            description: "Missing or wrong internal API key",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          404: {
            description: "No user with that email",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/users/me": {
      get: {
        summary: "Read the current user from X-User-Id (keyed, internal only)",
        description:
          "Returns only the user identified by the trusted X-User-Id header. Never returns passwordHash.",
        parameters: [
          { $ref: "#/components/parameters/InternalApiKey" },
          {
            in: "header",
            name: "X-User-Id",
            required: true,
            schema: { type: "string" },
            description: "User id derived by the business API from a verified JWT.",
          },
        ],
        responses: {
          200: {
            description: "The current user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PublicUser" },
              },
            },
          },
          401: {
            description: "Missing or wrong internal API key, or missing/invalid X-User-Id",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          404: {
            description: "No user with that id",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
      patch: {
        summary: "Update the current user's profile (keyed, internal only)",
        description:
          "Updates only displayName for the user in X-User-Id. Other body fields, including email, passwordHash, and any user id, are ignored.",
        parameters: [
          { $ref: "#/components/parameters/InternalApiKey" },
          { $ref: "#/components/parameters/UserId" },
        ],
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
            content: { "application/json": { schema: { $ref: "#/components/schemas/PublicUser" } } },
          },
          400: {
            description: "Invalid displayName",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          401: {
            description: "Missing or wrong internal API key, or missing/invalid X-User-Id",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          404: {
            description: "No user with that id",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/users/me/ai-settings": {
      get: {
        summary: "Read AI access status (keyed, internal only)",
        description: "Returns the mode and whether a key is set. Never returns the encrypted blob.",
        parameters: [
          { $ref: "#/components/parameters/InternalApiKey" },
          { $ref: "#/components/parameters/UserId" },
        ],
        responses: {
          200: { $ref: "#/components/responses/AiSettings" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/users/me/ai-settings/mode": {
      put: {
        summary: "Set AI access mode (keyed, internal only)",
        parameters: [
          { $ref: "#/components/parameters/InternalApiKey" },
          { $ref: "#/components/parameters/UserId" },
        ],
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
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/ai-usage": {
      post: {
        summary: "Record one AI operation (keyed, internal only)",
        description:
          "The owner is the trusted X-User-Id. Records hold no prompt text, key, or key fingerprint.",
        parameters: [
          { $ref: "#/components/parameters/InternalApiKey" },
          { $ref: "#/components/parameters/UserId" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["operation", "providerMode", "status"],
                properties: {
                  operation: { type: "string" },
                  providerMode: { type: "string", enum: ["application", "user"] },
                  model: { type: "string", nullable: true },
                  inputTokens: { type: "integer", nullable: true },
                  outputTokens: { type: "integer", nullable: true },
                  estimatedCostUsd: { type: "number", nullable: true },
                  status: { type: "string", enum: ["succeeded", "failed"] },
                  errorCode: { type: "string", nullable: true },
                  latencyMs: { type: "integer", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Usage recorded",
            content: {
              "application/json": {
                schema: { type: "object", properties: { data: { $ref: "#/components/schemas/AiUsage" } } },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/ai-usage/summary": {
      get: {
        summary: "Current-month usage totals and recent records (keyed, internal only)",
        description:
          "Totals are for the current calendar month in UTC, split by providerMode. Recent holds the five newest records for the user in X-User-Id.",
        parameters: [
          { $ref: "#/components/parameters/InternalApiKey" },
          { $ref: "#/components/parameters/UserId" },
        ],
        responses: {
          200: {
            description: "Usage summary",
            content: {
              "application/json": {
                schema: { type: "object", properties: { data: { $ref: "#/components/schemas/AiUsageSummary" } } },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/users/me/ai-key": {
      get: {
        summary: "Read the encrypted key blob (INTERNAL: key resolution only)",
        description:
          "Returns AES-256-GCM ciphertext, iv, and authTag for server-webApp to decrypt for a single call. Never browser-reachable; never forwarded to a client.",
        parameters: [
          { $ref: "#/components/parameters/InternalApiKey" },
          { $ref: "#/components/parameters/UserId" },
        ],
        responses: {
          200: {
            description: "Encrypted key blob",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/EncryptedKeyBlob" } },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      put: {
        summary: "Set or replace the encrypted key blob (keyed, internal only)",
        parameters: [
          { $ref: "#/components/parameters/InternalApiKey" },
          { $ref: "#/components/parameters/UserId" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/EncryptedKeyBlob" } },
          },
        },
        responses: {
          200: { $ref: "#/components/responses/AiSettings" },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        summary: "Remove the stored key (keyed, internal only)",
        parameters: [
          { $ref: "#/components/parameters/InternalApiKey" },
          { $ref: "#/components/parameters/UserId" },
        ],
        responses: {
          200: { $ref: "#/components/responses/AiSettings" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
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
  },
};
