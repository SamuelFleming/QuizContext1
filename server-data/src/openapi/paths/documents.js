const keyed = [
  { $ref: "#/components/parameters/InternalApiKey" },
  { $ref: "#/components/parameters/UserId" },
];
const subjectId = { in: "path", name: "subjectId", required: true, schema: { type: "string" } };
const documentId = { in: "path", name: "documentId", required: true, schema: { type: "string" } };

const documentResult = {
  content: {
    "application/json": {
      schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Document" } } },
    },
  },
};

export const documentPaths = {
  "/subjects/{subjectId}/documents": {
    get: {
      summary: "List a subject's documents without content (keyed, internal only)",
      parameters: [
        ...keyed,
        subjectId,
        {
          in: "query",
          name: "topicId",
          required: false,
          schema: { type: "string" },
          description:
            "A topic id lists that topic's documents; `none` lists documents attached to the subject itself; omitted lists all.",
        },
      ],
      responses: {
        200: {
          description: "Document summaries, oldest first",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "array", items: { $ref: "#/components/schemas/DocumentSummary" } },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/documents": {
    post: {
      summary: "Save a reviewed document (keyed, internal only)",
      description:
        "The subject, and the topic when given, must be owned by X-User-Id and belong together (else 404). Only reviewed text and metadata are stored.",
      parameters: keyed,
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: { $ref: "#/components/schemas/DocumentInput" } },
        },
      },
      responses: {
        201: { description: "Document saved", ...documentResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/documents/{documentId}": {
    get: {
      summary: "Read one of the caller's documents with content (keyed, internal only)",
      parameters: [...keyed, documentId],
      responses: {
        200: { description: "Document", ...documentResult },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      summary: "Update a document's title or text (keyed, internal only)",
      description:
        "Only title and content change. Subject, topic, and file metadata are fixed; other body fields are ignored.",
      parameters: [...keyed, documentId],
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: { $ref: "#/components/schemas/DocumentChanges" } },
        },
      },
      responses: {
        200: { description: "Updated document", ...documentResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      summary: "Delete a document (keyed, internal only)",
      parameters: [...keyed, documentId],
      responses: {
        200: { $ref: "#/components/responses/Deleted" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
