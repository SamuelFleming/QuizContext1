export const systemPaths = {
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
};
