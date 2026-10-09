# CareerContext AI Integration — Reference for QuizContext.io

CareerContext runs OpenAI **inside Express** via the official Node SDK **Responses API**. There is no FastAPI service, no embeddings, and no per-user keys. Flows never call the SDK directly.

Canonical spec: `docs/ML-Design/01_openai_provider_spec.md`. Overview: `docs/ML-Design/00_ml_design_overview.md`. Boundary ticket: `docs/devTickets/phase4/402-ai-service-boundary-and-client.md`. Portable snapshots of the AI boundary (not drop-in modules): `source-extract/`.

## Implemented architecture

```text
Controller (HTTP + error codes)
  → flow service (ownership, context assembly, AiRun lifecycle, suggest envelope)
    → runPrompt() in services/ai/index.js
      → promptRegistry (instructions, buildInput, jsonSchema, validate)
      → aiClient.createStructuredResponse()  // OpenAI Responses API
```

| Piece | Path | Role |
|---|---|---|
| Config / gating | `server/src/services/ai/aiConfig.js` | `OPENAI_API_KEY` + `AI_ENABLED`; env-driven models per **flow class** |
| Client | `server/src/services/ai/aiClient.js` | Timeouts, retries, `store: false`, JSON Schema `strict: true` |
| Registry | `server/src/services/ai/promptRegistry.js` | Versioned prompts in source (`key@version`); not stored in MongoDB |
| Validation helpers | `server/src/services/ai/structuredOutput.js` | Length caps, enums, `evidencedEnum` (value + source phrase) |
| Errors | `server/src/services/ai/aiErrors.js` | Closed taxonomy mapped to HTTP |
| Logging | `server/src/services/ai/aiRunService.js` + `server/src/models/AiRun.js` | Best-effort run log |
| Context packs | `server/src/services/ai/evidenceContextAssembly.js` | Bounded heuristic assembly (no RAG) |
| Prompts | `server/src/services/ai/prompts/*.js` | One file per flow: instructions, `buildInput`, schema, `validate` |

`runPrompt({ key, version, input })` is the only call flows need. A representative flow (`evidencePolishService.js`): open `AiRun` → `runPrompt` → complete with usage, or `failRun` and rethrow. Logging failures are swallowed so they cannot take down the AI call.

## Client contract (adapt this)

`createStructuredResponse` takes `{ flowClass, instructions, input, jsonSchema, maxOutputTokens }` and returns `{ data, model, usage: { inputTokens, outputTokens }, latencyMs }`.

- **Flow classes** (model knobs, not one model per endpoint): `extraction`, `polish`, `evaluation`, `generation` via `AI_MODEL_*` env vars. Defaults in `aiConfig.js` are **unverified** against the live catalogue — treat them as placeholders.
- SDK retries are disabled (`maxRetries: 0`); the client retries only `AI_TIMEOUT`, `AI_RATE_LIMITED`, `AI_PROVIDER_ERROR` with jittered backoff.
- Input is rejected **before** the call if `instructions + input` exceeds `AI_MAX_INPUT_CHARS` (default 60,000) → `AI_INPUT_TOO_LARGE` / 413.
- AI is off unless `AI_ENABLED` is true **and** a key exists → `AI_DISABLED` / 503. The rest of the app keeps working.
- Controllers attach `error.aiErrorCode` on the JSON body (`activityController.js` `handleActivityError`).

Error codes: `AI_DISABLED` 503, `AI_TIMEOUT` 504, `AI_RATE_LIMITED` 429, `AI_PROVIDER_ERROR` 502, `AI_REFUSED` / `AI_INCOMPLETE` / `AI_INVALID_OUTPUT` 422, `AI_INPUT_TOO_LARGE` 413. Refusals and incomplete Responses are treated as typed failures, not success.

Strict Structured Outputs require every property listed in `required` and `additionalProperties: false`. Changing an output shape is a four-place edit: prompt `jsonSchema` + `validate()`, flow service mapping, and the client that consumes the envelope (`.cursor/rules/ai.mdc`).

The client caches one SDK instance keyed on `config.apiKey`. That is fine for a single env secret; **per-user keys cannot reuse that cache as-is** — resolve the key per request (or cache by key fingerprint) and never put the raw key on `AiRun`.

## Prompts, grounding, and context

Prompts register with `registerPrompt`. Bump `version` when instructions or schema change behaviour. `AiRun.promptVersion` stores `key@version` so runs are reproducible without persisting the full prompt.

Untrusted user/document text is delimited and labelled as data, never instruction:

```text
<<<USER_CONTENT
...raw notes...
USER_CONTENT
```

See `prompts/evidencePolishPrompt.js` (`<<<PARENT_EXPERIENCE`, `<<<LINKED_EVIDENCE`). Schema constraint guarantees **shape**, not **truth** — every prompt still has a `validate()` that uses `structuredOutput.js`. Extraction uses `evidencedEnum`: a claimed enum without `sourceText` is downgraded to `unknown` / `not_specified`.

Context assembly is **heuristic and budgeted** (`evidenceContextAssembly.js`): per-item and total char caps, newest-first, truncation flags. Opportunity ranking by relevance (`docs/ML-Design/02_career_evidence_relevance.md`) is **planned (ticket 418)**, not the current default.

CareerContext’s grounding rule is **no invention** (no employer/date/metric/tech absent from source). QuizContext’s Strict / Targeted / Loose modes are a **different product control** — implement as an explicit generation parameter that selects instructions (and possibly schema fields such as source references), not as a one-line prompt tweak.

## Usage tracking vs user keys

**Implemented:** `AiRun` records `type`, target entity, `model`, `promptVersion`, `inputTokens`, `outputTokens`, `latencyMs`, `executionStatus`, `reviewStatus`, a short `inputSummary` (not the full prompt or source). Dual status is intentional: a technically successful run can still be user-rejected. Tickets: **403**.

**Not implemented:** `estimatedCost`, `providerMode` (app key vs user key), usage caps, billing. Ticket `docs/devTickets/phase4/4xx-user-supplied-api-keys.md` is a **deferred placeholder** — no encryption design, no model, no API. Today every call uses one server env key (`aiConfig.getApiKey()`). A module-level client cache keys off that single secret.

For QuizContext, split three concerns even if each is small: **key selection** (encrypted user key vs env fallback), **request execution** (this client), **usage records** (extend `AiRun` or a slimmer `AiUsage` with `providerMode` + estimated cost). Never log or return the key. CareerContext has no encrypt-at-rest pattern to copy.

## Human-in-the-loop (do not copy blindly)

CareerContext AI **suggests only**. Endpoints return `{ aiRunId, suggestion, current?, mergePreview?, meta }` and never write the source entity. Accept goes through the existing PUT (or a dedicated save for Evaluation/Document). Frontend: `client/src/components/ai/AiSuggestionPanel.jsx` plus `AI_DISCLOSURE`. Rule: `.cursor/rules/ai.mdc`.

QuizContext will persist generated quizzes and attempt evaluations as first-class records. Reuse suggest/review for **content descriptions**; for quiz generation and short-answer marking, persist as an explicit user-initiated operation with a logged run — not a silent overwrite, and not CareerContext’s review-panel UX on every call.

## Deliberately deferred in CareerContext

Embeddings / RAG / File Search, FastAPI ML service, async jobs, tool calling, per-user keys, cost metering. `store: false` on every Responses call so the provider does not keep application state; MongoDB is the system of record.
