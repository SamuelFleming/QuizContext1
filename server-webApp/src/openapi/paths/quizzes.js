const quizId = { in: "path", name: "quizId", required: true, schema: { type: "string" } };
const listParameters = [
  { in: "query", name: "page", schema: { type: "integer", minimum: 1, default: 1 } },
  { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 25, default: 25 } },
  {
    in: "query",
    name: "sort",
    schema: {
      type: "string",
      enum: ["newest", "oldest", "question_count_asc", "question_count_desc"],
      default: "newest",
    },
  },
  {
    in: "query",
    name: "topicIds",
    description: "Repeat 1-30 unique topic IDs. Matches any stored topicId or topicIds value.",
    schema: { type: "array", maxItems: 30, uniqueItems: true, items: { type: "string" } },
    style: "form",
    explode: true,
  },
  { in: "query", name: "questionCount", schema: { type: "integer", minimum: 1, maximum: 20 } },
  { in: "query", name: "multipleChoiceCount", schema: { type: "integer", minimum: 0, maximum: 20 } },
  { in: "query", name: "shortAnswerCount", schema: { type: "integer", minimum: 0, maximum: 20 } },
];

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

const generationResult = {
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: { data: { $ref: "#/components/schemas/QuizGenerationResult" } },
      },
    },
  },
};

export const quizPaths = {
  "/quizzes": {
    get: {
      summary: "List the caller's quizzes",
      description:
        "Returns a stable owner-scoped page. Topic filters use OR semantics and exclude whole-subject quizzes. Each item has safe summary fields and no questions or snapshot.",
      security: [{ bearerAuth: [] }],
      parameters: listParameters,
      responses: {
        200: {
          description: "Paginated quiz summaries",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { data: { $ref: "#/components/schemas/QuizListResult" } },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
    post: {
      summary: "Generate and save a quiz from the caller's subject, one topic, or an explicit topic set",
      description:
        "Assembles the caller's notes and documents, asks the AI for structured questions, validates them, and stores the quiz with a frozen source snapshot. Omit topicId and topicIds for the whole subject. topicId selects one topic and honours includeDescendants. topicIds (1 to 30) selects those topics only; includeDescendants is ignored and stored false, and topicId must be omitted. A selected topic with no notes and no documents is 400 and names that topic, with no AI call and no quiz. The response is the study view: prompts and options only, never answer keys, marking criteria, or snapshot text. Records one usage entry (operation quiz_generation) unless the content is insufficient or a selected topic is incomplete.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/QuizGenerateInput" },
          },
        },
      },
      responses: {
        201: { description: "Quiz saved (study view plus safe AI run diagnostics)", ...generationResult },
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
                  failures: {
                    type: "array",
                    maxItems: 20,
                    items: { type: "string", maxLength: 80 },
                  },
                  aiRun: {
                    $ref: "#/components/schemas/AiRun",
                    description: "Present for AI_INVALID_OUTPUT; absent when no AI call was made.",
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
  "/quizzes/preview": {
    post: {
      summary: "Preview quiz-generation input metrics",
      description:
        "Validates and assembles the same caller-owned context as generation without calling AI or writing a quiz or usage record. Exact provider token counts are not available until generation completes.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/QuizPreviewInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Safe input and source-count preview",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { data: { $ref: "#/components/schemas/QuizPreview" } },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        422: {
          description: "CONTEXT_INSUFFICIENT; no AI call was made",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  code: { type: "string", enum: ["CONTEXT_INSUFFICIENT"] },
                },
              },
            },
          },
        },
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
