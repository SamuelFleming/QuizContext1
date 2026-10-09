const keyed = [
  { $ref: "#/components/parameters/InternalApiKey" },
  { $ref: "#/components/parameters/UserId" },
];
const subjectId = { in: "path", name: "subjectId", required: true, schema: { type: "string" } };
const topicId = { in: "path", name: "topicId", required: true, schema: { type: "string" } };

const topicResult = {
  content: {
    "application/json": {
      schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Topic" } } },
    },
  },
};

export const topicPaths = {
  "/subjects/{subjectId}/topics": {
    get: {
      summary: "List a subject's topics as a flat array (keyed, internal only)",
      description:
        "Every topic in the subject with its parentTopicId; the caller builds the tree. 404 when the subject is missing or not owned by X-User-Id.",
      parameters: [...keyed, subjectId],
      responses: {
        200: {
          description: "Topics, oldest first",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "array", items: { $ref: "#/components/schemas/Topic" } },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    post: {
      summary: "Create a topic in a subject (keyed, internal only)",
      description:
        "parentTopicId null creates a top-level topic. The parent must be owned by X-User-Id (else 404) and sit in the same subject (else 400).",
      parameters: [...keyed, subjectId],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/TopicInput" } } },
      },
      responses: {
        201: { description: "Topic created", ...topicResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/topics/{topicId}": {
    get: {
      summary: "Read one of the caller's topics (keyed, internal only)",
      parameters: [...keyed, topicId],
      responses: {
        200: { description: "Topic", ...topicResult },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      summary: "Update name, description, or notes (keyed, internal only)",
      description: "The parent and subject cannot change. Other body fields are ignored.",
      parameters: [...keyed, topicId],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/ContentInput" } } },
      },
      responses: {
        200: { description: "Updated topic", ...topicResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      summary: "Delete a topic, its descendants, and their documents (keyed, internal only)",
      parameters: [...keyed, topicId],
      responses: {
        200: { $ref: "#/components/responses/TopicDeleted" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
