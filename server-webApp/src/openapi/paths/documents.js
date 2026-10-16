const auth = [{ bearerAuth: [] }];
const subjectId = { in: "path", name: "subjectId", required: true, schema: { type: "string" } };
const documentId = { in: "path", name: "documentId", required: true, schema: { type: "string" } };
const error = (description) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
});

const documentResult = {
  content: {
    "application/json": {
      schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Document" } } },
    },
  },
};

export const documentPaths = {
  "/documents/extract": {
    post: {
      summary: "Extract text from an uploaded file for review",
      description:
        "Accepts one .md, .markdown, .txt, or text-based .pdf up to 5 MB. Returns the extracted text and metadata; nothing is saved and the file is not stored.",
      security: auth,
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["file"],
              properties: { file: { type: "string", format: "binary" } },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Extracted text for review",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { data: { $ref: "#/components/schemas/ExtractedDocument" } },
              },
            },
          },
        },
        400: error("No file in the `file` field"),
        401: { $ref: "#/components/responses/Unauthorized" },
        413: error("File larger than 5 MB"),
        415: error("Unsupported file type"),
        422: error(
          "No extractable text (scanned/image-only PDF, no OCR), unreadable PDF, invalid UTF-8, empty file, or text over 200,000 characters",
        ),
      },
    },
  },
  "/documents": {
    post: {
      summary: "Save a reviewed document on a subject or topic",
      description:
        "Stores the reviewed title and text plus light file metadata. The subject and topic must belong to the signed-in user and to each other.",
      security: auth,
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
      summary: "Read a document with its text",
      security: auth,
      parameters: [documentId],
      responses: {
        200: { description: "Document", ...documentResult },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      summary: "Edit a document's title or text",
      description: "A document cannot move to another subject or topic.",
      security: auth,
      parameters: [documentId],
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
      summary: "Delete a document",
      security: auth,
      parameters: [documentId],
      responses: {
        200: { $ref: "#/components/responses/Deleted" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/subjects/{subjectId}/documents": {
    get: {
      summary: "List a subject's documents (without text)",
      security: auth,
      parameters: [
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
};
