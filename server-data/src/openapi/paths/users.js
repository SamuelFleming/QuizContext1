export const userPaths = {
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
    patch: {
      summary: "Update the current user's profile (keyed, internal only)",
      description:
        "Updates only displayName for the user in X-User-Id. Other body fields, including email, passwordHash, and any user id, are ignored.",
      parameters: [
        { $ref: "#/components/parameters/InternalApiKey" },
        { $ref: "#/components/parameters/UserId" },
      ],
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
          content: { "application/json": { schema: { $ref: "#/components/schemas/PublicUser" } } },
        },
        400: {
          description: "Invalid displayName",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
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
  "/users/me/ai-settings": {
    get: {
      summary: "Read AI access status (keyed, internal only)",
      description: "Returns the mode and whether a key is set. Never returns the encrypted blob.",
      parameters: [
        { $ref: "#/components/parameters/InternalApiKey" },
        { $ref: "#/components/parameters/UserId" },
      ],
      responses: {
        200: { $ref: "#/components/responses/AiSettings" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/users/me/ai-settings/mode": {
    put: {
      summary: "Set AI access mode (keyed, internal only)",
      parameters: [
        { $ref: "#/components/parameters/InternalApiKey" },
        { $ref: "#/components/parameters/UserId" },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["aiAccessMode"],
              properties: { aiAccessMode: { type: "string", enum: ["application", "user"] } },
            },
          },
        },
      },
      responses: {
        200: { $ref: "#/components/responses/AiSettings" },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/users/me/ai-key": {
    get: {
      summary: "Read the encrypted key blob (INTERNAL: key resolution only)",
      description:
        "Returns AES-256-GCM ciphertext, iv, and authTag for server-webApp to decrypt for a single call. Never browser-reachable; never forwarded to a client.",
      parameters: [
        { $ref: "#/components/parameters/InternalApiKey" },
        { $ref: "#/components/parameters/UserId" },
      ],
      responses: {
        200: {
          description: "Encrypted key blob",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { data: { $ref: "#/components/schemas/EncryptedKeyBlob" } },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    put: {
      summary: "Set or replace the encrypted key blob (keyed, internal only)",
      parameters: [
        { $ref: "#/components/parameters/InternalApiKey" },
        { $ref: "#/components/parameters/UserId" },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: { $ref: "#/components/schemas/EncryptedKeyBlob" } },
        },
      },
      responses: {
        200: { $ref: "#/components/responses/AiSettings" },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      summary: "Remove the stored key (keyed, internal only)",
      parameters: [
        { $ref: "#/components/parameters/InternalApiKey" },
        { $ref: "#/components/parameters/UserId" },
      ],
      responses: {
        200: { $ref: "#/components/responses/AiSettings" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
