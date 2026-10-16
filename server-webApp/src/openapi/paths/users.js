export const userPaths = {
  "/users/me": {
    get: {
      summary: "Read the signed-in user",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "The signed-in user (no password hash)",
          content: { "application/json": { schema: { $ref: "#/components/schemas/UserResult" } } },
        },
        401: {
          description: "Missing, invalid, or expired token",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
    patch: {
      summary: "Update the signed-in user's profile",
      description: "Only displayName can change. Email and password are not editable here.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["displayName"],
              properties: { displayName: { type: "string", minLength: 1, maxLength: 80 } },
            },
          },
        },
      },
      responses: {
        200: {
          description: "The updated user",
          content: { "application/json": { schema: { $ref: "#/components/schemas/UserResult" } } },
        },
        400: {
          description: "Missing or over-long display name",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        401: {
          description: "Missing, invalid, or expired token",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
  },
};
