# P3-03 — OpenAI boundary, key resolution, usage record, and connectivity check

**Status:** Done  
**Phase:** 3  
**Depends on:** P3-02  
**Relevant scope:** MVP plan Phase 3 and §3; F02; S08; `docs/reference/01_AI-Integration.md` (advisory)

## Objective
One service in `server-webApp` runs a controlled OpenAI call with the per-request resolved key and records usage. Settings can run a connectivity check.

## In scope
- **Key resolution, per request.** `user` mode decrypts that user's stored key and fails with `AI_KEY_MISSING` when there is none. `application` mode uses `OPENAI_API_KEY` and requires `AI_ENABLED=true`, otherwise `AI_DISABLED`. The resolved key exists only in memory for that call.
- **Client boundary.** One module wraps the official `openai` Node SDK (Responses API) with structured JSON output, `store: false`, a timeout, and SDK retries off. Adapt CareerContext's client contract: return `{ data, model, usage: { inputTokens, outputTokens }, latencyMs }`. Do not cache a client keyed on one env secret. Build the client per call, or cache it by a non-reversible key fingerprint.
- **Typed errors.** A small closed set mapped to HTTP: `AI_DISABLED` 503, `AI_KEY_MISSING` 400, `AI_AUTH_FAILED` 502 (the provider rejected the key), `AI_TIMEOUT` 504, `AI_RATE_LIMITED` 429, `AI_PROVIDER_ERROR` 502, `AI_INVALID_OUTPUT` 422. The body is `{ message, code }`. It never contains the key or the raw provider error body.
- **Usage record.** New `server-data` collection `AiUsage`, owned by `X-User-Id`: `operation`, `providerMode` (`application` | `user`), `model`, `inputTokens`, `outputTokens`, `estimatedCostUsd`, `status` (`succeeded` | `failed`), `errorCode`, `latencyMs`, `createdAt`. No prompt text, no key, no fingerprint. Keyed create route. Writing usage is best-effort: a logging failure does not fail the user call.
- **Estimated cost** comes from a small per-model price table in `server-webApp` config (USD per 1M input/output tokens), overridable by env. Unknown models record `estimatedCostUsd: null`.
- **Model** from `AI_MODEL_DEFAULT` env. Its default is a placeholder to verify against the live catalogue.
- `POST /settings/ai/check` behind `requireAuth`: a tiny fixed structured prompt (for example `{ "ok": true }`), validated server-side, recorded as operation `connectivity_check`. It returns `{ ok, providerMode, model, latencyMs }` or a typed error.
- Client: a "Test connection" button in the AI access section showing success or the typed error message.
- Add `OPENAI_API_KEY`, `AI_ENABLED`, `AI_MODEL_DEFAULT`, `AI_TIMEOUT_MS` to `server-webApp/.env.example`. Update Swagger on both APIs.

## Out of scope
- Prompt registry, versioned product prompts, context assembly (Phase 5).
- Usage summary UI and the application-key limit (P3-04).
- Multiple providers, billing.

## Acceptance checks
- [x] With a valid key (application or user), the check succeeds and one `AiUsage` record holds model, tokens, cost, and `providerMode`. (Verified against a local mock of the Responses endpoint; see notes.)
- [x] `user` mode with no key returns `AI_KEY_MISSING`. `application` mode with `AI_ENABLED` off returns `AI_DISABLED`. An invalid user key returns `AI_AUTH_FAILED`. Each failure writes a `failed` usage record with no key material.
- [x] Switching mode between calls uses the correct key on the next call, with no stale cached client.
- [x] With AI disabled or the provider failing, login, `GET /users/me`, and profile edit still work.
- [x] Logs and responses contain no plaintext key, ciphertext, or fingerprint. Usage records contain no prompt text.
- [x] Swagger lists `POST /settings/ai/check` and the `server-data` usage create route.
- [x] If no real OpenAI key is available locally, verify the error paths and document the success path as unrun.

## Implementation notes
Keep resolution, execution, and usage writing as three small functions under one `server-webApp` AI folder. Phase 5 will call this boundary, so do not build a prompt registry now.

Implemented in `server-webApp/src/ai/`: `keyResolver.js`, `aiClient.js` (new SDK client per call, `store: false`, SDK retries off), `aiService.js` (`runAiOperation`, the single entry point, records usage best-effort), `aiErrors.js`, `aiConfig.js` (model and price table are placeholders to verify). Refusals and incomplete responses map to `AI_INVALID_OUTPUT`. AI error bodies are `{ message, code }`.

No OpenAI key was configured locally, so a real successful call is unrun. The invalid-key path was checked against the real provider. The success path, cost estimate, and per-mode key selection were checked with a test-only instance whose `OPENAI_BASE_URL` pointed at a local mock.
