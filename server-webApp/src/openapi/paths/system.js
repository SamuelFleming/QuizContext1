export const systemPaths = {
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
};
