# server-webApp

User-facing **business API** for QuizContext. Owns JWT authentication, application workflows, context assembly, quiz generation/evaluation orchestration, and the single OpenAI boundary. Persists nothing itself: it calls **`server-data`** over an internal API key and passes a trusted user id.

Default URL: http://localhost:4017  
Swagger: http://localhost:4017/api/docs

## Run

Prerequisites: MongoDB and `server-data` running (see the [root README](../README.md)).

```bash
cp .env.example .env   # if you have not already
npm install
npm start
```

`npm start` runs `node src/index.js`.

### Environment (high level)

| Variable | Purpose |
| --- | --- |
| `PORT` | Listen port (default `4017`) |
| `CLIENT_ORIGIN` | CORS allowlist for the Vite app |
| `DATA_API_BASE_URL` | `server-data` base URL |
| `INTERNAL_API_KEY` | Must match `server-data` |
| `JWT_SECRET` | Signs Bearer tokens for the browser |
| `AI_KEY_ENCRYPTION_KEY` | Encrypts user-provided OpenAI keys at rest (32 bytes, base64) |
| `OPENAI_API_KEY` / `AI_ENABLED` / `AI_MODEL_DEFAULT` | Application-provided AI access |
| `AI_TIMEOUT_MS` / `AI_QUIZ_TIMEOUT_MS` | OpenAI call timeouts |
| `AI_APP_MONTHLY_TOKEN_LIMIT` | Cap for the application key (user keys are not limited here) |

Do not log or return raw API keys or encryption material.

## What this layer owns

- Register/login and JWT-protected routes
- Subject/topic/document workflows exposed to the client
- Context resolution and context-mode behaviour for AI calls
- Quiz generation, attempt submission orchestration, and short-answer evaluation via AI
- AI settings, key selection (app vs user key), usage limits, and run logging
- Document text extraction for uploads (PDF/Office/text helpers as implemented)

It does **not** own Mongoose schemas or trust a browser-supplied `userId` for data access. Ownership is enforced again in `server-data` using the trusted id this service sends.

## Request flow

```text
Route → Middleware (JWT) → Controller → Service
                              ↓
                    services/dataApi/*  →  server-data
                              ↓
                         openai/*       →  OpenAI (when needed)
```

Controllers translate HTTP only. Business rules live in `services/`. Controllers never call OpenAI, `fetch` to Mongo, or Mongoose directly.

## Folder layout (`src/`)

```text
index.js, app.js     Process start; mount routes and middleware
routes/              Paths + middleware + controller binding
middleware/          JWT auth, error handling
controllers/         Read request → call service → send envelope
services/            Application workflows
services/dataApi/    Internal client for server-data (one file per resource)
openai/              Sole OpenAI boundary (client, prompts, errors, limits, key resolve)
constants/           Validation rules, enums, AI experiment knobs
config/              Environment-derived configuration
utils/               HTTP errors, key crypto helpers, …
openapi/             Live Swagger: paths/<domain>.js + shared components
```

**Patterns to keep:**

- Only `services/dataApi/` talks to `server-data`.
- Only `openai/` talks to OpenAI.
- Bound and label untrusted source text in prompts; report truncated/excluded context rather than silently dropping it.
- Validate structured AI output before asking `server-data` to store it.
- When you add or change an implemented endpoint, update `openapi/paths/<domain>.js` in the same change.

## Core domain surfaces (routes)

Mounted in `app.js` (representative): `/auth`, `/users`, `/settings`, `/subjects`, `/topics`, `/documents`, `/quizzes`, `/attempts`, `/study-history`, `/ai`, plus diagnostics and `/api/docs`.

## Related docs

- Architecture and layer rules: [`docs/core-scope/02_high-level-solution.md`](../docs/core-scope/02_high-level-solution.md) §5
- Agent invariants: [`CLAUDE.md`](../CLAUDE.md)
- Sibling data API: [`server-data/README.md`](../server-data/README.md)
