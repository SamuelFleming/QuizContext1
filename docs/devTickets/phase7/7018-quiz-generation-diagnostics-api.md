# 7018 — Quiz generation diagnostics API

**Status:** Done (syntax, app creation, OpenAPI, and client integration verified; mocked provider acceptance pending manual UAT)
**Phase:** 7
**Depends on:** 7015
**Relevant scope:** F05; S05; `04_flows-to-screens.md` §7.3

## Objective
Provide safe, server-computed quiz input metrics before generation and return the matching AI run summary after generation so the client can explain what is happening without querying Profile.

## In scope
- Add an authenticated quiz preview endpoint using the same request validation, selected-topic completeness checks, context assembly, and prompt input construction as generation.
- Preview makes no AI call and stores neither a quiz nor an AI usage record.
- Preview returns the selection name, prompt input character count, maximum output tokens, and topic/document counts split by included, truncated, and excluded status.
- Exact input and output token counts remain completion-only provider results; preview must not present an estimate as exact.
- Return an allow-listed `aiRun` summary with a successful generated quiz and with typed AI errors when a run was attempted.
- The summary may contain the fields already visible on Profile: operation, prompt version, provider mode, model, input/output tokens, estimated cost, status, error code, latency, context counts, input characters, maximum output tokens, scope metadata, and bounded failures.
- Keep existing generated quiz fields at the top level of the response data so current clients do not need a new nested quiz shape.
- Update the business API OpenAPI for preview and generation success/error diagnostics.

## Out of scope
- Polling, streaming, web sockets, background jobs, or cancellation.
- Retry, output-cap, prompt, schema, or model changes.
- A data API endpoint for usage records or any persistence schema change.
- Returning source text, prompt instructions, raw model output, credentials, answer keys, or marking criteria.

## Acceptance checks
- [ ] Preview of a valid multi-topic request returns input characters, output cap, and source counts without an AI usage record or quiz write. *(Pending manual API UAT.)*
- [x] Preview and generation use the same trusted, user-scoped context assembly and topic checks.
- [ ] A mocked successful generation returns the study view plus a succeeded `aiRun` with token counts and no failures. *(Pending provider-mocked UAT.)*
- [ ] A mocked `AI_INVALID_OUTPUT` response returns its code, failures, and a failed `aiRun` retaining provider token counts. *(Pending provider-mocked UAT.)*
- [x] Insufficient context is rejected before `runAiOperation`, so it has no `aiRun`.
- [x] Public preview/run projections contain no source bodies, instructions, credentials, raw output, answer keys, or marking criteria.
- [x] Business OpenAPI matches the preview and generation response shapes and loads successfully.
- [x] Changed server files pass `node --check`; the business app and OpenAPI module instantiate successfully.

## Implementation notes
Build the prompt input once from the assembled context in a shared service helper. Count topic and document manifest entries per status; the loading UI can derive the number actually sent from included plus truncated. Build one public run object in `aiService` and reuse it for persistence input, successful return metadata, and typed errors.
