# 8004 — Quiz model selection + preview cost estimates (API)

**Status:** Done  
**Phase:** 8  
**Depends on:** 8002, 7018  
**Relevant scope:** Quiz generation (F05); AI model catalogue; preview metrics

## Objective
Expose the model catalogue over the business API, accept an optional `model` on quiz preview and generate, and return server-computed pre-call cost approximations from preview so the client can show estimates before generation.

## In scope
- Add `displayName` on each `AI_MODELS` entry (Luna, Sol, Astra, GPT-4o mini, GPT-4.1 mini).
- `GET /ai/models` (JWT on existing `/ai` routes): return `{ id, displayName, priceInputPer1M, priceOutputPer1M }` rows from the catalogue only.
- Optional string `model` on quiz preview and generate request bodies; unknown ids → typed `AI_UNKNOWN_MODEL` 400. Omitted → existing `resolveModel` default (active experiment run).
- Pass requested `model` into `runAiOperation` on generate.
- Extend preview response with estimate fields derived from resolved model + assembled input (keep top-level `inputChars` / `maxOutputTokens` for 7019 compatibility):
  - `model` (resolved id)
  - `estimatedInputTokens` — `ceil(billableChars / 4)` where billable chars = user `input` length + quiz-generation instructions length
  - `estimatedInputCostUsd`
  - `estimatedOutputCostUsd` — ceiling using `maxOutputTokens`
  - `estimatedTotalCostUsd` — input estimate + output ceiling
- Shared helper next to `estimateCostUsd` for the chars→tokens heuristic and USD math.
- Update live OpenAPI for changed/new endpoints.
- Focused check covering catalogue list shape, heuristic costs, and unknown model rejection on preview.

## Out of scope
- Client UI / model picker.
- Per-request context, output cap, reasoning, or timeout overrides.
- Optional `model` on evaluate or description-suggestion APIs.
- Mongo-backed catalogue or automatic OpenAI price sync.
- Client-side price math as the source of truth.
- Changing prompt, schema, or question limits.

## Acceptance checks
- [x] Authenticated `GET /ai/models` returns every catalogue id with displayName and both USD rates; unauthenticated is rejected.
- [x] `POST /quizzes/preview` with a known `model` returns resolved `model`, `inputChars`, estimate token/cost fields, and `maxOutputTokens`; omitted `model` still previews using the experiment default.
- [x] Unknown `model` on preview or generate returns `AI_UNKNOWN_MODEL` without calling OpenAI or writing a quiz.
- [x] `POST /quizzes` with a valid `model` passes that id through `resolveModel` into the AI call path.
- [x] Estimate wording in OpenAPI marks token/cost fields as approximations / output ceiling, not provider billing.
- [x] No browser → `server-data` catalogue path; catalogue remains in `server-webApp` only.
- [x] Focused verification run (script and/or request smoke) passes; OpenAPI updated.

## Outcome notes
- `GET /ai/models`, optional `model` on preview/generate, preview estimate fields, and OpenAPI shipped.
- Focused check: `node scripts/checkAiModels.js` (catalogue list, heuristic costs, unknown model). Changed files pass `node --check`.
- Live HTTP auth smoke for `GET /ai/models` left to manual UAT / 8005 browser work.

## Implementation notes
- Mount list on `server-webApp/src/routes/aiRoutes.js` beside description suggestions.
- Reuse `resolveModel` / `getModelMeta` / `estimateCostUsd`; do not duplicate rate tables.
- Instructions length must be included in billable chars because `INSTRUCTIONS` are sent separately from `input` today.
