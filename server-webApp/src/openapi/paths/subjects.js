const auth = [{ bearerAuth: [] }];
const subjectId = { in: "path", name: "subjectId", required: true, schema: { type: "string" } };

const subjectResult = {
  content: {
    "application/json": {
      schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Subject" } } },
    },
  },
};

const contentBody = {
  required: true,
  content: { "application/json": { schema: { $ref: "#/components/schemas/ContentInput" } } },
};

export const subjectPaths = {
  "/subjects": {
    get: {
      summary: "List the signed-in user's subjects",
      security: auth,
      responses: {
        200: {
          description: "Subjects, most recently updated first",
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
      summary: "Create a subject",
      description: "name is required. Any user id in the body is ignored.",
      security: auth,
      requestBody: contentBody,
      responses: {
        201: { description: "Subject created", ...subjectResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/subjects/{subjectId}": {
    get: {
      summary: "Read a subject",
      security: auth,
      parameters: [subjectId],
      responses: {
        200: { description: "Subject", ...subjectResult },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      summary: "Update a subject's name, description, or notes",
      security: auth,
      parameters: [subjectId],
      requestBody: contentBody,
      responses: {
        200: { description: "Updated subject", ...subjectResult },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      summary: "Delete a subject",
      description: "Hard delete, including the subject's topics and documents.",
      security: auth,
      parameters: [subjectId],
      responses: {
        200: { $ref: "#/components/responses/Deleted" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
