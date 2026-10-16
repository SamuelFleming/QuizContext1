# CareerContext Reusable Patterns — Reference for QuizContext.io

CareerContext is a **single Express API** (`Route → Controller → Service → Model`) plus a React/Vite client. QuizContext’s dual-API (`server-webApp` → `server-data`) is a different topology. Copy **layering and ownership**, not the process count or the career domain. JWT and load-owned snapshots: `source-extract/middleware/` (`README.md` in that folder).

## Backend layering

Controllers stay HTTP-only (params, status, envelopes). Services own business rules and user-scoped queries. AI is isolated under `server/src/services/ai/` and is never reached from controllers via the OpenAI SDK.

If QuizContext splits processes: keep this same split **inside** `server-webApp` (routes/controllers/services/AI client) and make `server-data` a persistence API (validation, ownership, repositories). Do not put prompts, context assembly, or quiz scoring in the data service.

Shared utilities worth adapting:

- `server/src/utils/serviceError.js` — `{ statusCode, message }` thrown from services; controllers map to JSON.
- `server/src/utils/listQuery.js` — `limit` (default 20, max 100), `offset`, `sort`, `order`, `search`; list envelope `{ data, meta: { count, total, limit, offset, hasMore } }`.
- Mongoose `toJSON` transform: expose `id` string, drop `_id` / `__v` / secrets (`User.js` also `select: false` on `passwordHash`).

Response conventions (`docs/core-scope/08_api_contract.md`): read `{ data }`, writes `{ message, data }`, errors `{ message }` (AI adds `code`). OpenAPI is fragment-based (`server/src/openapi/paths/*.json`) and documents **implemented** routes only.

## Auth and ownership

JWT in `Authorization: Bearer`; payload `req.user.userId` is the only user identity trusted (`server/src/middleware/auth/authenticateWithJwt.js`). Never take `userId` from the request body. Typed 401s: `AUTH_REQUIRED`, `TOKEN_EXPIRED`, `TOKEN_INVALID`. Passwords: bcrypt in `authService.js`. JSON `POST`/`PUT` also go through `mediaTypeValidator`.

If QuizContext uses an internal key between `server-webApp` and `server-data`, treat that as a **second** auth mechanism on the data API only — do not overload the user JWT middleware for service-to-service calls.

Nested resources use **load-owned middleware** that 404s unless `_id` **and** `userId` match, then attach the document to `req` (e.g. `middleware/evidence/loadOwnedExperience.js`). ObjectId params are rejected as 400 before the query. This pattern is the right default for Subject / Topic / Document / Quiz / Attempt. Dashboard/workspace payloads are **capped previews**, not unbounded child arrays (ticket **206**) — important once a subject tree or quiz history can grow.

Soft delete (`isArchived` + `archivedAt`, excluded from default reads) is CareerContext’s evidence convention — optional for QuizContext; hard-delete of study files may be simpler if you do not need an archive story.

## Documents and Markdown

Decision (tickets **351**–**353**): persist **extracted Markdown/`content`**, not original bytes. Upload is memory-ingest; metadata (`originalFileName`, `mimeType`, `extractionStatus`) is kept; export is `.md` (API-044). Model: `server/src/models/Document.js`.

Extraction: `server/src/services/documentTextExtractionService.js` — `.md`/`.txt` as UTF-8; PDF via `pdf-parse`; `.docx` via `mammoth`; `.pptx`/`.doc` via `officeparser`. QuizContext MVP (text + extractable PDF) can keep this service and drop office formats until needed. There is no OCR.

Frontend: one editor/preview pair — `client/src/components/editor/MarkdownEditor.jsx` + `MarkdownPreview.jsx` (`react-markdown` + `remark-gfm`). Do not render user Markdown as HTML. A post-upload review step (**353**) lets the user edit extracted text before it becomes source — highly relevant before that text is used as quiz context.

CareerContext’s **raw vs polished** fields (`overviewRaw` / `overviewPolished`) encode source-of-truth vs derived text. QuizContext can use the same idea for topic descriptions (user notes vs AI-assisted summary) without copying those field names.

## Frontend conventions (selective)

- `client/src/features/<domain>/` for screens; `components/ui/` for primitives; `services/apiClient.js` + one domain service file. No `fetch` in presentational components.
- `ApiError` preserves HTTP `status` and machine `code` (needed for `AI_DISABLED` and JWT expiry). `setUnauthorizedHandler` on `apiClient.js` re-prompts login on 401 rather than showing a generic failure. Token key is namespaced (`careercontext_auth_token`) — QuizContext should use its own. Protected routes wrap an `AppShell`; public auth stays outside.
- Folder hygiene per domain: `index/` / `detail/` / `shared/` (tickets **322**/**323**) once a second screen appears; not required on day one.
- Design-system fidelity (Interactive CV, entity accent tokens) is CareerContext-specific. QuizContext's visual source is `docs/design/01_design-concept.md` (Light Mint & Indigo). Reuse the token habit, not the career visual language.

## What transfers conceptually vs what to avoid

**Transfer:** user-owned trees of Markdown + attached documents as AI context; generate an artefact that **retains its source scope**; log the model/prompt version used. CareerContext does this for cover letters (`Document.aiRunId`). QuizContext needs the same for quizzes (scope + `contextMode` + enough source snapshot to explain later evaluation).

**Do not transfer:** Experience → Activity as a two-level non-recursive hierarchy. QuizContext topics are recursive (`parentTopicId`). Do not model Subtopic as a separate collection. Content resolution for “quiz this subject/topic ± descendants” is a new mechanism — CareerContext has no equivalent tree walk.

**Do not transfer:** suggest-only persistence as a universal law. Quizzes and attempts are the product; descriptions can stay HITL.

**Do not transfer:** a second Python/ML service, embeddings, or CareerContext’s screen catalogue / entity CRUD list. Dual-API service-to-service auth (internal API key) is **new** — CareerContext has only user JWT.

**Limitation:** some contract docs lag code (`AiRun` split status vs `05_data_model.md` single `status`; ticket **414** stalled). Prefer `server/src` + OpenAPI over older narrative docs when they disagree.
