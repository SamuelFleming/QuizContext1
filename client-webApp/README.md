# client-webApp

React + Vite presentation layer for QuizContext. This app is the only process the browser talks to for business data: it calls **`server-webApp`** and never calls `server-data` or OpenAI directly.

Default URL: http://localhost:5017

## Run

**First time on this machine?** Install Node.js and MongoDB, create all three `.env` files, and start every process using the beginner walkthrough: [docs/getting-started-local.md](../docs/getting-started-local.md).

Once dependencies exist and MongoDB + both APIs are already running, from this folder:

```bash
cp .env.example .env   # if you have not already
npm install
npm start
```

| Script | Purpose |
| --- | --- |
| `npm start` / `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Oxlint |

### Environment

| Variable | Purpose |
| --- | --- |
| `PORT` | Dev server port (default `5017`) |
| `VITE_WEB_API_BASE_URL` | Base URL of `server-webApp` (default `http://localhost:4017`) |

Only `VITE_*` variables are exposed to browser code.

## What this layer owns

- Auth UI, shell navigation, and feature screens (content workspace, quiz generate/play/review, profile/AI settings)
- Loading, empty, validation, and AI-failure states in the UI
- Markdown edit/preview for notes and descriptions
- Keeping **answer keys and marking criteria out of the Quiz Player** until the attempt is submitted

It does **not** own quiz scoring, context assembly, encryption of API keys, or MongoDB access.

## Folder layout (`src/`)

```text
main.jsx           Vite entry
app/               App root, route switch, navigation helpers
components/        Shared UI (layout, markdown, AI run details, …)
context/           App-wide React state (auth)
features/<domain>/ Screens and components used by one feature only
services/          apiClient + one service file per domain
styles/            Design tokens and global CSS
utils/             Pure helpers
```

**Patterns to keep:**

- Components do not call `fetch`. They go through `services/`.
- `services/apiClient.js` holds the shared HTTP client, auth token, and `ApiError` shape.
- A component that belongs to one feature lives under `features/<domain>/`. Move it to `components/` only when a second feature needs it.
- Colours come from CSS variables in `styles/` (Light Mint & Indigo). Prefer token names over hard-coded hex.

## Domain map (features)

| Folder | Typical job |
| --- | --- |
| `features/auth` | Register / login |
| `features/content` | Subjects, topic tree, notes, documents, workspace panels |
| `features/quizzes` | Generate, library, player, results, context notices |
| `features/profile` | Profile, AI access, usage |
| `features/dashboard` | Home / study history surfaces |
| `features/diagnostics` | Connectivity checks against the business API |

## Design notes

Visual source of truth: [`docs/design/01_design-concept.md`](../docs/design/01_design-concept.md). Screen responsibilities: [`docs/core-scope/04_flows-to-screens.md`](../docs/core-scope/04_flows-to-screens.md).
