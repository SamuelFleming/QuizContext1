export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "QuizContext data API",
    version: "0.1.0",
    description: "Persistence API. Documents implemented routes only.",
  },
  paths: {
    "/health": {
      get: {
        summary: "Process health",
        responses: {
          200: {
            description: "The data API process is up",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Health" },
              },
            },
          },
        },
      },
    },
    "/diagnostics/database": {
      get: {
        summary: "MongoDB reachability",
        parameters: [
          {
            in: "header",
            name: "X-Internal-Api-Key",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Database status. failed means MongoDB could not be reached.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DatabaseStatus" },
              },
            },
          },
          401: {
            description: "Missing or wrong internal API key",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Health: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              service: { type: "string", example: "server-data" },
              status: { type: "string", example: "ok" },
            },
          },
        },
      },
      DatabaseStatus: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              database: { type: "string", enum: ["ok", "failed"] },
            },
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
};
