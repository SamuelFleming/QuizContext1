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
    "/users": {
      post: {
        summary: "Create a user (keyed, internal only)",
        description:
          "The business API supplies an already-hashed password. The response omits passwordHash.",
        parameters: [{ $ref: "#/components/parameters/InternalApiKey" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "passwordHash", "displayName"],
                properties: {
                  email: { type: "string" },
                  passwordHash: { type: "string" },
                  displayName: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PublicUser" },
              },
            },
          },
          400: {
            description: "Missing required fields",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          401: {
            description: "Missing or wrong internal API key",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          409: {
            description: "A user with that email already exists",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/users/by-email": {
      get: {
        summary: "Login lookup by email (keyed, internal only)",
        description:
          "Returns the user including passwordHash so the business API can compare it. Never browser-reachable.",
        parameters: [
          { $ref: "#/components/parameters/InternalApiKey" },
          { in: "query", name: "email", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "User found (includes passwordHash)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthUser" },
              },
            },
          },
          401: {
            description: "Missing or wrong internal API key",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          404: {
            description: "No user with that email",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/users/me": {
      get: {
        summary: "Read the current user from X-User-Id (keyed, internal only)",
        description:
          "Returns only the user identified by the trusted X-User-Id header. Never returns passwordHash.",
        parameters: [
          { $ref: "#/components/parameters/InternalApiKey" },
          {
            in: "header",
            name: "X-User-Id",
            required: true,
            schema: { type: "string" },
            description: "User id derived by the business API from a verified JWT.",
          },
        ],
        responses: {
          200: {
            description: "The current user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PublicUser" },
              },
            },
          },
          401: {
            description: "Missing or wrong internal API key, or missing/invalid X-User-Id",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          404: {
            description: "No user with that id",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
  },
  components: {
    parameters: {
      InternalApiKey: {
        in: "header",
        name: "X-Internal-Api-Key",
        required: true,
        schema: { type: "string" },
      },
    },
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
      PublicUser: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string" },
              displayName: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
      AuthUser: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string" },
              displayName: { type: "string" },
              passwordHash: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  },
};
