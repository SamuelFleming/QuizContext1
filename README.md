# QuizContext

QuizContext is a MERN study platform: you organise **Subjects → Topics → Documents**, then generate, sit, and review **AI-backed quizzes** grounded in that material. The primary MVP context mode is **Targeted** (source-grounded with room for reasonable interpretation); Strict and Loose remain design-compatible.

Inspired by CareerContext-style content management and AI outcomes, personal exam prep needs, and shared infrastructure goals with Recall Radio. See more info on the project ideation, business case, and v1 scope & initial design [here](#understand-the-product).

## Run from scratch

Two ways to start the apps. Do **not** run both at once: Compose and local `npm start` both need port **4017**.

### Local Node (Vite on 5017)

If you have an IDE but are new to Node apps, use the full walkthrough (install Node, MongoDB, create `.env` files, start all three processes):

**→ [docs/getting-started-local.md](docs/getting-started-local.md)**

Short version once tools are installed:

```bash
# 1) Copy env examples (PowerShell: use Copy-Item — see the getting-started guide)
cp server-data/.env.example server-data/.env
cp server-webApp/.env.example server-webApp/.env
cp client-webApp/.env.example client-webApp/.env
# Edit secrets: same INTERNAL_API_KEY in both servers; JWT_SECRET + AI_KEY_ENCRYPTION_KEY in server-webApp

# 2) Three terminals (MongoDB must already be running)
cd server-data && npm install && npm start
cd server-webApp && npm install && npm start
cd client-webApp && npm install && npm start
```

Then open http://localhost:5017 and register a user. AI is optional; see the getting-started guide to enable it.

### Docker Compose (built SPA on 4017)

Needs Docker Desktop (or Docker Engine + Compose). This is the hosted packaging: two containers, React served from `server-webApp`. The data API stays on the Compose network (no public 4007). Stop the three local `npm start` processes first.

```bash
# From the repo root (PowerShell: Copy-Item .env.example .env)
cp .env.example .env
# Edit .env: INTERNAL_API_KEY, JWT_SECRET, AI_KEY_ENCRYPTION_KEY.
# For Mongo on this machine: MONGODB_URI=mongodb://host.docker.internal:27017/quizcontext
# For a browser on this machine: CLIENT_ORIGIN=http://127.0.0.1:4017
# Leave OPENAI_API_KEY empty and AI_ENABLED=false unless you want the application key.

docker compose up --build
```

Then open http://127.0.0.1:4017 (not 5017). Health: http://127.0.0.1:4017/health. Stop with `docker compose down`. Do not commit `.env`.

Internet INT (`https://int.quizcontext.app`, Caddy, Atlas) is a later cutover; see [docs/reference/Deployment/deployment-operator-checklist.md](docs/reference/Deployment/deployment-operator-checklist.md).

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

## Product concepts (short)

| Concept | Meaning |
| --- | --- |
| Subject / Topic / Document | User-owned study tree; topics nest recursively; documents supply extractable text |
| Context mode | How tightly quizzes stick to sources (MVP focus: Targeted) |
| Quiz | Durable generated assessment; not rewritten when source notes change |
| Attempt / Evaluation | One sitting and its marking outcome; stored separately from the quiz |
| AI run / usage | Logged operations and token use for the application key |

## Other docs

- [docs/getting-started-local.md](docs/getting-started-local.md) — install dependencies and run locally from scratch
- `docs/devTickets/` — implementation tickets and queue
- `CLAUDE.md` — agent/engineering guide for this repo

Layer READMEs cover folder layout, request flow, and layer-specific invariants after the app is running.

### Understand the product

Start here if you want the **business case, origin, and aims** before (or after) running the code:

| Doc | What it covers |
| --- | --- |
| [docs/core-scope/01-high-level-idea.md](docs/core-scope/01-high-level-idea.md) | Motivation, problem, vision, core product concepts |
| [docs/core-scope/02_high-level-solution.md](docs/core-scope/02_high-level-solution.md) | MVP scope, architecture, layer responsibilities |
| [docs/core-scope/03_product-theory.md](docs/core-scope/03_product-theory.md) | Context modes and product theory |
| [docs/core-scope/04_flows-to-screens.md](docs/core-scope/04_flows-to-screens.md) | User flows mapped to screens |

Visual design: [docs/design/01_design-concept.md](docs/design/01_design-concept.md) (Light Mint & Indigo).

