export const aiPaths = {
  "/ai/models": {
    get: {
      summary: "List AI models available for quiz generation",
      description:
        "Returns the server-webApp model catalogue (id, display name, and USD per 1M input/output rates). Rates are estimates only. Authenticated callers use these ids in quiz preview and generate.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Catalogue models",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/AiModel" },
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
  "/ai/description-suggestions": {
    post: {
      summary: "Suggest a description for a subject or topic from the user's own content",
      description:
        "Assembles the caller's notes and documents for the selection (Targeted mode, character-bounded, source-labelled) and asks the AI for a short description. Nothing is saved; accept a suggestion by updating the subject or topic. Records one usage entry (operation description_suggestion) with the prompt version and context counts, unless the content is insufficient, in which case no AI call is made.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["subjectId"],
              properties: {
                subjectId: { type: "string" },
                topicId: { type: "string", nullable: true },
                includeDescendants: {
                  type: "boolean",
                  default: true,
                  description: "For a topic, include its subtopics. A subject always includes everything.",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Suggested description and what context it was based on",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      description: { type: "string", maxLength: 2000 },
                      promptVersion: { type: "string" },
                      contextMode: { type: "string", enum: ["very_strict", "targeted", "loose"] },
                      context: {
                        type: "object",
                        properties: {
                          truncated: { type: "boolean" },
                          manifest: {
                            type: "array",
                            items: { $ref: "#/components/schemas/ContextManifestEntry" },
                          },
                          totals: {
                            type: "object",
                            properties: {
                              includedChars: { type: "integer" },
                              availableChars: { type: "integer" },
                              budgetChars: { type: "integer" },
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
        400: { $ref: "#/components/responses/AiError" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        422: {
          description:
            "CONTEXT_INSUFFICIENT (not enough notes or document text; no AI call made) or AI_INVALID_OUTPUT (output failed validation and was discarded)",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  code: { type: "string", enum: ["CONTEXT_INSUFFICIENT", "AI_INVALID_OUTPUT"] },
                  failures: {
                    type: "array",
                    maxItems: 20,
                    items: { type: "string", maxLength: 80 },
                  },
                },
              },
            },
          },
        },
        429: { $ref: "#/components/responses/AiError" },
        502: { $ref: "#/components/responses/AiError" },
        503: { $ref: "#/components/responses/AiError" },
        504: { $ref: "#/components/responses/AiError" },
      },
    },
  },
};
