export const settingsPaths = {
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
      summary: "This month's AI usage, one page of recent runs, and remaining application allowance",
      description:
        "Monthly totals stay unchanged between pages. Recent is an all-time page, newest first. Defaults are page 1 and limit 5.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "page",
          schema: { type: "integer", minimum: 1 },
          description: "Positive page number. Defaults to 1.",
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", minimum: 1, maximum: 25 },
          description: "Records per page. Defaults to 5.",
        },
      ],
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
                      pagination: { $ref: "#/components/schemas/Pagination" },
                      applicationLimit: { $ref: "#/components/schemas/ApplicationLimit" },
                    },
                  },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
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
};
