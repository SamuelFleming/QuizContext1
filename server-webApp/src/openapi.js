export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "QuizContext business API",
    version: "0.1.0",
    description: "User-facing business API. Documents implemented routes only.",
  },
  paths: {
    "/health": {
      get: {
        summary: "Process health",
        responses: {
          200: {
            description: "The business API process is up",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Health" },
              },
            },
          },
        },
      },
    },
    "/diagnostics/connectivity": {
      get: {
        summary: "Connectivity across the business API, data API, and MongoDB",
        responses: {
          200: {
            description: "Each part is ok or failed. A failed downstream part still returns this body.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Connectivity" },
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
              service: { type: "string", example: "server-webApp" },
              status: { type: "string", example: "ok" },
            },
          },
        },
      },
      Connectivity: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              webApp: { type: "string", enum: ["ok", "failed"] },
              dataApi: { type: "string", enum: ["ok", "failed"] },
              database: { type: "string", enum: ["ok", "failed"] },
            },
          },
        },
      },
    },
  },
};
