const keyed = [
  { $ref: "#/components/parameters/InternalApiKey" },
  { $ref: "#/components/parameters/UserId" },
];
const subjectId = { in: "path", name: "subjectId", required: true, schema: { type: "string" } };

const subjectResult = {
  content: {
    "application/json": {
      schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Subject" } } },
    },
  },
};

export const subjectPaths = {
  "/subjects": {
    get: {
      summary: "List the caller's subjects (keyed, internal only)",
      description: "Only subjects owned by X-User-Id, most recently updated first.",
      parameters: keyed,
      responses: {
        200: {
          description: "Subjects",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "array", items: { $ref: "#/components/schemas/Subject" } },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
    post: {
      summary: "Create a subject owned by X-User-Id (keyed, internal only)",
      description: "The owner is always X-User-Id. A userId in the body is ignored.",
      parameters: keyed,
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/ContentInput" } } },
      },
      responses: {
        201: { description: "Subject created", ...subjectResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/subjects/{subjectId}": {
    get: {
      summary: "Read one of the caller's subjects (keyed, internal only)",
      parameters: [...keyed, subjectId],
      responses: {
        200: { description: "Subject", ...subjectResult },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      summary: "Update name, description, or notes (keyed, internal only)",
      description: "Other body fields are ignored. Missing or not owned returns 404.",
      parameters: [...keyed, subjectId],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/ContentInput" } } },
      },
      responses: {
        200: { description: "Updated subject", ...subjectResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      summary: "Delete a subject (keyed, internal only)",
      description: "Hard delete, including the subject's topics and documents. Missing or not owned returns 404.",
      parameters: [...keyed, subjectId],
      responses: {
        200: { $ref: "#/components/responses/Deleted" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
