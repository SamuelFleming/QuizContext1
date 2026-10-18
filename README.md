# QuizContext

QuizContext is a MERN study platform: you organise **Subjects → Topics → Documents**, then generate, sit, and review **AI-backed quizzes** grounded in that material. The primary MVP context mode is **Targeted** (source-grounded with room for reasonable interpretation); Strict and Loose remain design-compatible.

Inspired by CareerContext-style content management and AI outcomes, personal exam prep needs, and shared infrastructure goals with Recall Radio.

## Architecture

Three processes, one MongoDB:

```text
client-webApp (React / Vite)     →  browser UI; calls the business API only
        ↓ JWT
server-webApp (Express)          →  auth, workflows, context assembly, OpenAI
        ↓ internal API key + trusted user id
server-data (Express)            →  persistence, validation, ownership checks
        ↓
     MongoDB
```

| Layer | Role | Local URL | README |
| --- | --- | --- | --- |
| `client-webApp` | Presentation | http://localhost:5017 | [client-webApp/README.md](client-webApp/README.md) |
| `server-webApp` | Business API | http://localhost:4017 | [server-webApp/README.md](server-webApp/README.md) |
| `server-data` | Data API | http://localhost:4007 | [server-data/README.md](server-data/README.md) |

Swagger (implemented routes only):

- Business API: http://localhost:4017/api/docs
- Data API: http://localhost:4007/api/docs

## Run from scratch

### Prerequisites

- Node.js (current LTS is fine)
- MongoDB running locally (default URI below)
- An OpenAI API key **only if** you want AI features; the app can start with AI disabled

### 1. Configure environment

Copy each example file and edit secrets. Use the **same** `INTERNAL_API_KEY` in both server `.env` files.

```bash
cp server-data/.env.example server-data/.env
cp server-webApp/.env.example server-webApp/.env
cp client-webApp/.env.example client-webApp/.env
```

Minimum values to set:

| Variable | Where | Notes |
| --- | --- | --- |
| `INTERNAL_API_KEY` | `server-data` + `server-webApp` | Shared secret; must match |
| `JWT_SECRET` | `server-webApp` | Signs user sessions |
| `AI_KEY_ENCRYPTION_KEY` | `server-webApp` | 32 random bytes, base64 (see comment in `.env.example`) |
| `MONGODB_URI` | `server-data` | Default `mongodb://127.0.0.1:27017/quizcontext` |
| `OPENAI_API_KEY` / `AI_ENABLED` | `server-webApp` | Leave `AI_ENABLED=false` until you want app-key AI |

### 2. Start the three apps

Use separate terminals. Order matters only in that MongoDB and `server-data` should be up before the business API serves real traffic.

```bash
cd server-data && npm install && npm start
cd server-webApp && npm install && npm start
cd client-webApp && npm install && npm start
```

Open http://localhost:5017 and register a user.

### 3. Optional: enable AI

In `server-webApp/.env`, set `AI_ENABLED=true` and a valid `OPENAI_API_KEY`, then restart `server-webApp`. Users can also store their own encrypted OpenAI key from Profile.

## Product concepts (short)

| Concept | Meaning |
| --- | --- |
| Subject / Topic / Document | User-owned study tree; topics nest recursively; documents supply extractable text |
| Context mode | How tightly quizzes stick to sources (MVP focus: Targeted) |
| Quiz | Durable generated assessment; not rewritten when source notes change |
| Attempt / Evaluation | One sitting and its marking outcome; stored separately from the quiz |
| AI run / usage | Logged operations and token use for the application key |

## Docs worth knowing

- `docs/core-scope/` — product charter and flows
- `docs/design/01_design-concept.md` — visual source of truth (Light Mint & Indigo)
- `docs/devTickets/` — implementation tickets and queue
- `CLAUDE.md` — agent/engineering guide for this repo

Layer READMEs cover folder layout, request flow, and layer-specific invariants. Prefer those over inventing new structure when adding code.
