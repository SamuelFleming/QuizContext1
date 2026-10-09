export const authPaths = {
  "/auth/register": {
    post: {
      summary: "Register a new account",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "displayName", "password"],
              properties: {
                email: { type: "string", format: "email" },
                displayName: { type: "string" },
                password: { type: "string", minLength: 8 },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Account created; returns a JWT and the user",
          content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResult" } } },
        },
        400: {
          description: "Invalid input",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        409: {
          description: "Email already registered",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
  },
  "/auth/login": {
    post: {
      summary: "Log in to an existing account",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Logged in; returns a JWT and the user",
          content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResult" } } },
        },
        400: {
          description: "Missing email or password",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        401: {
          description: "Invalid email or password (same message for both)",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
  },
};
