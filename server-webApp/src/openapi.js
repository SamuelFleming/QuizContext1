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
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
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
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string" },
          displayName: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthResult: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              token: { type: "string" },
              user: { $ref: "#/components/schemas/User" },
            },
          },
        },
      },
      UserResult: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/User" },
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
