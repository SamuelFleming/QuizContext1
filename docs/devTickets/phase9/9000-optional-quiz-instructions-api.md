# 9000 — Optional quiz instructions API, prompt, and persistence

**Status:** Done
**Phase:** 9
**Depends on:** Phase 8
**Relevant scope:** F05 / S05 quiz generation; versioned AI prompts; durable quiz settings

## Objective
Accept optional learner instructions for quiz generation, apply them as bounded preferences separate from source evidence, and store them with the generated quiz without changing empty-instruction behaviour.

## In scope
- Optional `quizInstructions` on quiz preview and generation, trimmed and limited to 2,000 characters.
- Exact legacy `quiz-generation@1` instructions and input when the value is absent, null, empty, or whitespace-only.
- `quiz-generation@2` for non-empty instructions, with a clearly delimited `LEARNER_PREFERENCES` section and explicit precedence below source grounding, enforced quiz settings, validation, and safety.
- Preview input/cost estimates include supplied instructions.
- Nullable quiz persistence and owner-scoped study-view projection; legacy records return `null` without migration.
- Live OpenAPI updates on both APIs.

## Out of scope
- UI changes, presets, profile preferences, instruction rewriting/moderation, regeneration, prompt/schema changes unrelated to this field, retries, batching, and higher question limits.
- Copying instructions into the source snapshot, source manifest, AI usage diagnostics, logs, or quiz-list summaries.

## Acceptance checks
- [x] Absent/blank instructions produce the unchanged `quiz-generation@1` system instructions and user input and store `null`.
- [x] Non-empty instructions use `quiz-generation@2`, appear once in a separate learner-preferences section, contribute to preview size, and persist after successful generation.
- [x] Preferences are explicitly subordinate to counts, format, difficulty/context mode, source support, factual accuracy, validation, and safety.
- [x] Non-string or over-2,000-character values return 400 before an AI call; the internal data API independently rejects invalid values.
- [x] Owner isolation remains enforced; study view exposes the historical value but no answer keys, criteria, or source snapshot.
- [x] Diagnostics, manifests, logs, and list summaries do not expose instructions.
- [x] Both APIs' OpenAPI documents the implemented request and response fields.
- [x] Focused prompt, persistence, ownership, and contract checks pass or any limitation is documented.

## Implementation notes
- Primary files: `server-webApp/src/openai/prompts/quizGeneration.js`, `server-webApp/src/services/quizService.js`, `server-webApp/src/services/quizStudyView.js`, `server-data/src/models/quiz.js`, and `server-data/src/controllers/quizController.js`.
- Keep the strict JSON schema and generated-question validator unchanged.

## Outcome notes
- Empty instructions resolve to the unchanged version 1 instructions/input; supplied instructions use version 2 and a JSON-quoted learner-preferences block.
- Both service import/startup checks, changed-file syntax checks, prompt compatibility assertions, data-model validation, OpenAPI assertions, safe study-view projection, and IDE lint pass.
- A live provider call and seeded Mongo ownership smoke were not run; ownership wiring remains unchanged.
