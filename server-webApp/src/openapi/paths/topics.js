const auth = [{ bearerAuth: [] }];
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
      summary: "List a subject's topics",
      description: "Flat array with parentTopicId; the client builds the tree.",
      security: auth,
      parameters: [subjectId],
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
      summary: "Create a topic",
      description:
        "parentTopicId null creates a top-level topic. A parent in another subject returns 400; a parent the user does not own returns 404.",
      security: auth,
      parameters: [subjectId],
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
      summary: "Read a topic",
      security: auth,
      parameters: [topicId],
      responses: {
        200: { description: "Topic", ...topicResult },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      summary: "Update a topic's name, description, or notes",
      description: "Topics cannot be moved; parent and subject are fixed.",
      security: auth,
      parameters: [topicId],
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
      summary: "Delete a topic, all of its descendants, and their documents",
      security: auth,
      parameters: [topicId],
      responses: {
        200: { $ref: "#/components/responses/TopicDeleted" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
