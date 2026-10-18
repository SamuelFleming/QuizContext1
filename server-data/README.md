# server-data

Internal **data API** for QuizContext. Owns MongoDB persistence, input validation at the data boundary, and **user ownership checks**. It has no OpenAI client, no quiz scoring logic, and is not intended for browser access.

Default URL: http://localhost:4007  
Swagger: http://localhost:4007/api/docs

## Run

**First time on this machine?** Install Node.js and MongoDB, create all three `.env` files, and start every process using the beginner walkthrough: [docs/getting-started-local.md](../docs/getting-started-local.md).

Prerequisite for this app alone: MongoDB reachable at `MONGODB_URI`.

```bash
cp .env.example .env   # if you have not already
npm install
npm start
```

`npm start` runs `node src/index.js`.

### Environment

| Variable | Purpose |
| --- | --- |
| `PORT` | Listen port (default `4007`) |
| `MONGODB_URI` | Mongo connection string (default `mongodb://127.0.0.1:27017/quizcontext`) |
| `INTERNAL_API_KEY` | Shared secret with `server-webApp`; must match exactly |

## What this layer owns

- Mongoose models and repositories for users, subjects, topics, documents, quizzes, attempts, AI usage, study history, and related records
- Scoping every user-owned read/write to a trusted user id
- Persistence validation and consistent response envelopes
- Live OpenAPI for routes that are actually implemented

It does **not** assemble study context for prompts, call OpenAI, encrypt user API keys, or decide quiz marks. Those stay in `server-webApp`.

## Auth model (important)

This API is protected by the **internal API key**, not by JWT.

1. `server-webApp` authenticates the end user (JWT).
2. It calls `server-data` with `INTERNAL_API_KEY` and a trusted **`X-User-Id`** header.
3. Middleware validates the key and ObjectId, then attaches `req.userId`.
4. Repositories scope queries to that id.

Never treat a caller-supplied user id from an untrusted client as authoritative. The browser should not talk to this service.

## Request flow

```text
Route → Middleware (internal key + X-User-Id) → Controller → Repository → Model → MongoDB
```

Controllers read the request, validate shape, call repositories, and shape the response. They do not contain product workflows.

## Folder layout (`src/`)

```text
index.js, app.js     Process start; mount routes and middleware
routes/              Paths + middleware + controller binding
middleware/          Internal API key, trusted X-User-Id, errors
controllers/         HTTP translation → repositories
repositories/        Mongoose queries, always scoped to trusted user id
models/              Schemas and public transforms
constants/           Shared limits and enums
config/              Database connection
utils/               Response helpers
openapi/             Live Swagger: paths/<domain>.js + shared components
```

**Patterns to keep:**

- Repositories always filter by the trusted user id for user-owned data.
- Routes stay thin; persistence logic lives in repositories, not in route files.
- When you add or change an implemented endpoint, update `openapi/paths/<domain>.js` in the same change.
- Prefer existing response/error helpers over ad-hoc shapes.

## Core domain surfaces (routes)

Mounted in `app.js` (representative): `/users`, `/subjects`, `/topics`, `/documents`, `/quizzes`, `/attempts`, `/study-history`, `/ai-usage`, plus diagnostics and `/api/docs`.

## Related docs

- Architecture and layer rules: [`docs/core-scope/02_high-level-solution.md`](../docs/core-scope/02_high-level-solution.md) §5
- Agent invariants: [`CLAUDE.md`](../CLAUDE.md)
- Sibling business API: [`server-webApp/README.md`](../server-webApp/README.md)
