export const aiUsagePaths = {
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
                promptVersion: { type: "string", nullable: true },
                context: { $ref: "#/components/schemas/AiUsageContext" },
                inputChars: { type: "integer", nullable: true },
                maxOutputTokens: { type: "integer", nullable: true },
                scope: { $ref: "#/components/schemas/AiUsageScope" },
                failures: {
                  type: "array",
                  maxItems: 20,
                  items: { type: "string", maxLength: 80 },
                },
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
      summary: "Current-month usage totals and a page of recent records (keyed, internal only)",
      description:
        "Totals are for the current calendar month in UTC, split by providerMode. Recent is one all-time page for the user in X-User-Id, newest first. Defaults are page 1 and limit 5.",
      parameters: [
        { $ref: "#/components/parameters/InternalApiKey" },
        { $ref: "#/components/parameters/UserId" },
        {
          in: "query",
          name: "page",
          schema: { type: "integer", minimum: 1 },
          description: "Positive page number. Defaults to 1.",
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", minimum: 1, maximum: 100 },
          description: "Records per page. Defaults to 5.",
        },
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
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
};
