export const aiPaths = {
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
