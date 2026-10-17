# 7015 — AI run diagnostics

**Status:** Planned  
**Phase:** 7  
**Depends on:** None  
**Relevant scope:** Phase 7 README; P3-03; P5-02; P6-01

## Objective
Each AI call, especially quiz generation, records the scope and size of what was sent, the token counts, and why a failed reply was rejected. A cut-off reply is distinguishable from a reply that failed a structure check.

## In scope
- Extend the existing `AiUsage` record. Do not add a second log collection. Still no API key, key fingerprint, prompt instructions, or source text.
- On every call through `runAiOperation`, keep today's fields and add:
  - `inputChars` — length of the input string sent to the model.
  - `maxOutputTokens` — the cap requested for that call.
  - `scope` — operation-specific and small. For quiz generation and description suggestion: subject id, topic id when there is one, selection name, and the context manifest entries already computed (`type`, `id`, `title`, `path`, `chars`, `status`). No block body. For answer evaluation: quiz id and attempt id only.
  - `failures` — a list of short reason codes, empty on success. Cap the list at 20.
- Quiz-generation reasons, one code per failed check, including the question index when a single question fails:
  - `output_truncated` when the provider marks the reply incomplete.
  - `output_refused` when the provider returns a refusal.
  - `output_not_json` when the reply text is not JSON.
  - `question_count`, `prompt`, `concepts`.
  - `mc_options`, `mc_duplicate`, `mc_correct_index`.
  - `sa_expected_answer`, `sa_criteria`.
  - `source_ref` when a cited source id was not included or truncated.
- Description suggestion and answer evaluation record the same output codes (`output_truncated`, `output_refused`, `output_not_json`) and one code per check their own validators already perform. Do not invent new product rules for those prompts.
- A truncated or refused reply still stores the token counts from that provider response. Today those counts are dropped because parsing throws before the usage is kept.
- The HTTP error for these cases stays `AI_INVALID_OUTPUT` with the current message. The body also includes `failures` when any were recorded. No other error code is added.
- Swagger on both APIs for the new usage fields and the `failures` array on that error.

## Out of scope
- Profile display (7016).
- Raising the 8,000-token generation cap, retrying a failed call, or changing the quiz JSON schema.
- Storing the raw model JSON, the answer key, or the source text on the usage record.
- Changing which quizzes are accepted. A reply that fails still discards the quiz.

## Acceptance checks
- [ ] A mocked quiz reply with the wrong question count stores `failures` containing `question_count`, plus `inputChars`, `maxOutputTokens`, and a manifest whose entries have titles and no body text. The quiz is not stored.
- [ ] A mocked incomplete reply stores `output_truncated` and the token counts from that response. It does not store `question_count`.
- [ ] A successful mocked generation stores the same metrics, an empty `failures` list, and the scope manifest.
- [ ] A description suggestion with an over-long suggestion stores a failure code and no source text.
- [ ] No usage document contains the key, the prompt instructions, or a `<<<SOURCE` body.
- [ ] User B cannot read user A's usage summary. The business error JSON for a validation failure is `{ message, code, failures }` and has no answer key.
- [ ] Swagger on both APIs matches the changed usage and error shapes.

## Implementation notes
`validate` in `quizGeneration.js` currently returns true or false, so every structure failure becomes `AI_INVALID_OUTPUT` with no detail. `parseOutput` in `aiClient.js` uses that same code for an incomplete reply, a refusal, and invalid JSON. Return the reason from those checks and pass it into `recordUsage`. The manifest is already built in `quizService.js` before the call; pass the titles and counts, not `context.text`.
