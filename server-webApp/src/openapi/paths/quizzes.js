const quizId = { in: "path", name: "quizId", required: true, schema: { type: "string" } };

const playerResult = {
  content: {
    "application/json": {
      schema: { type: "object", properties: { data: { $ref: "#/components/schemas/PlayerPayload" } } },
    },
  },
};

const studyViewResult = {
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: { data: { $ref: "#/components/schemas/QuizStudyView" } },
      },
    },
  },
};

export const quizPaths = {
  "/quizzes": {
    get: {
      summary: "List the caller's quizzes, newest first",
      description:
        "Each item has the title, scope names, mode, difficulty, question count, created date, attempt count, and the latest evaluated result. No questions or snapshot.",
      security: [{ bearerAuth: [] }],
      parameters: [{ in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 100 } }],
      responses: {
        200: { description: "Quiz summaries" },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
    post: {
      summary: "Generate and save a quiz from the caller's subject or topic",
      description:
        "Assembles the caller's notes and documents, asks the AI for structured questions, validates them, and stores the quiz with a frozen source snapshot. The response is the study view: prompts and options only, never answer keys, marking criteria, or snapshot text. Records one usage entry (operation quiz_generation) unless the content is insufficient.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["subjectId", "multipleChoiceCount", "shortAnswerCount"],
              properties: {
                subjectId: { type: "string" },
                topicId: { type: "string", nullable: true },
                includeDescendants: { type: "boolean", default: true },
                multipleChoiceCount: { type: "integer", minimum: 0 },
                shortAnswerCount: { type: "integer", minimum: 0 },
                difficulty: { type: "string", enum: ["easy", "medium", "hard"], default: "medium" },
                contextMode: {
                  type: "string",
                  enum: ["very_strict", "targeted", "loose"],
                  default: "targeted",
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Quiz saved (study view)", ...studyViewResult },
        400: { $ref: "#/components/responses/BadRequest" },
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
  "/quizzes/{quizId}/attempts": {
    get: {
      summary: "List attempts for a saved quiz",
      description: "Each attempt's id, status, dates, and score. An in-progress attempt can be resumed.",
      security: [{ bearerAuth: [] }],
      parameters: [quizId],
      responses: {
        200: { description: "Attempt summaries" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    post: {
      summary: "Start an attempt, or resume the in-progress one",
      description:
        "Returns the player payload: the attempt and the study-view quiz. No answer key, marking criteria, or snapshot.",
      security: [{ bearerAuth: [] }],
      parameters: [quizId],
      responses: {
        200: { description: "Player payload", ...playerResult },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/quizzes/{quizId}/export": {
    get: {
      summary: "Export a quiz as Markdown",
      description:
        "Returns { filename, markdown }. The file includes the questions and an answer-key section with correct options, expected answers, criteria, and source titles. It does not include the snapshot or any attempts.",
      security: [{ bearerAuth: [] }],
      parameters: [quizId],
      responses: {
        200: { description: "Markdown export" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/quizzes/{quizId}": {
    get: {
      summary: "Read a saved quiz as the study view",
      description:
        "Returns prompts, options, settings, and source titles/status. Never includes correct answers, expected answers, marking criteria, or snapshot text.",
      security: [{ bearerAuth: [] }],
      parameters: [quizId],
      responses: {
        200: { description: "Quiz (study view)", ...studyViewResult },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      summary: "Delete a quiz and its attempts",
      description: "Subject, topic, and document content is left in place.",
      security: [{ bearerAuth: [] }],
      parameters: [quizId],
      responses: {
        200: { description: "Deleted" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
