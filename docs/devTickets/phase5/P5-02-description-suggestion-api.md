# P5-02 — Description suggestion API, versioned prompt, and run log

**Status:** Done  
**Phase:** 5  
**Depends on:** P5-01  
**Relevant scope:** MVP plan Phase 5 and §3 "AI setup before product AI" and "Failure isolation"; F04 steps 2–4; `CLAUDE.md` engineering invariants

## Objective
A JWT-protected business route takes a subject or topic selection and returns an AI-suggested description built from the P5-01 context package. It goes through the Phase 3 boundary with a versioned prompt and validated output, and the run is logged. Nothing is written to the subject or topic.

## In scope
- Prompt module (proposed `server-webApp/src/openai/prompts/descriptionSuggestion.js`) exporting `PROMPT_VERSION` (e.g. `description-suggestion@1`), the instructions, the JSON schema (`{ description: string }`), and a validator. The validator rejects an empty, non-string, or over-limit description. The limit is the existing description limit of 2,000 characters.
- Instructions treat the labelled block as source data only. The output is a short Markdown description of what the selection covers, without new facts.
- Service (proposed `services/descriptionSuggestionService.js`): call `assembleContext` with mode `targeted`. If the content is insufficient, return 422 with code `CONTEXT_INSUFFICIENT` and do not call AI. Otherwise call `runAiOperation` with operation `description_suggestion`.
- Route: proposed `POST /ai/description-suggestions` with body `{ subjectId, topicId?, includeDescendants? }` (default true for topics). Response: `{ description, promptVersion, contextMode, context: { truncated, manifest, totals } }`. The manifest holds titles and status only, never source text.
- Run log: extend `AiUsage` and `runAiOperation` with optional `promptVersion` and `context` (`{ contextMode, includedChars, sourcesIncluded, sourcesTruncated, sourcesExcluded }`), on success and failure. Still no prompt text, source text, or key. Update the data API model, validation, and Swagger.
- Errors: existing AI codes pass through unchanged (`AI_DISABLED`, `AI_KEY_MISSING`, `AI_LIMIT_REACHED`, `AI_INVALID_OUTPUT`, …). Ownership failures return 404. A body `userId` is ignored.
- Swagger on the business API for the new route, including 422 `CONTEXT_INSUFFICIENT` and the AI error responses.

## Out of scope
- Client UI (P5-03).
- Saving the suggestion. Saving goes through the existing subject or topic `PATCH`.
- Quiz prompts, a prompt registry or admin, and streaming.

## Acceptance checks
- [x] With a mocked provider, a topic with notes and documents returns a suggestion and its manifest. The usage record shows `description_suggestion`, `promptVersion`, context counts, tokens, and `succeeded`.
- [x] Mocked output that is empty, over 2,000 characters, or the wrong shape returns `AI_INVALID_OUTPUT` and writes a failed record. The subject or topic `description` is unchanged.
- [x] Oversized content returns the suggestion with `context.truncated: true`.
- [x] Insufficient content returns 422 `CONTEXT_INSUFFICIENT` and makes no AI call or usage record.
- [x] With AI disabled, a missing user key, or the limit reached, the matching typed error is returned, and content routes still work.
- [x] User B asking about user A's subject or topic gets 404. No token gives 401.
- [x] No response, log line, or `AiUsage` document contains the key, prompt instructions, or source text.
- [x] Swagger on both APIs reflects the new route and the extended usage fields.

## Implementation notes
- A real OpenAI call is still unrun locally (Phase 3 follow-up). Run one if a key is available; otherwise record the limitation.
- Mock the provider the same way the P3-03 and P3-04 checks did.
