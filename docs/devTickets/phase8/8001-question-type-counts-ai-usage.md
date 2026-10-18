# 8001 — Persist question-type counts on AI usage

**Status:** Done  

**Phase:** 8  
**Depends on:** 7015  
**Relevant scope:** AI usage records; quiz generation; attempt evaluation

## Diagnosis
Question-type counts are not on stored AI usage today. Profile Recent Activity and shared `AiRun` details cannot show them until `server-webApp` records them, `server-data` accepts and returns them, and both OpenAPI specs document the nullable fields. This is not a frontend-only change. Ticket 8003 owns the display.

## Objective
Persist how many multiple-choice and short-answer questions were involved for `quiz_generation` and `answer_evaluation` runs, plus how many non-blank short answers were sent to the model on evaluation, so Profile and generate/evaluate diagnostics can later show those counts.

## In scope
### Persist (both APIs)
- Extend AI usage `context` with nullable integers:
  - `multipleChoiceCount`
  - `shortAnswerCount`
  - `shortAnswerAiCount`
- `server-data`: schema, create validation via Mongoose, `toAiUsage` mapping, OpenAPI.
- `server-webApp` when calling `runAiOperation` / recording usage:
  - **`quiz_generation`:** store requested generation counts from the generate body (`settings.multipleChoiceCount`, `settings.shortAnswerCount`), including on failed attempts that still write a usage row. Leave `shortAnswerAiCount` null.
  - **`answer_evaluation`:** store the quiz’s question-type totals (`multipleChoiceCount`, `shortAnswerCount`) and `shortAnswerAiCount` = number of non-blank short answers sent to the model (MC and blank SA are marked locally and never hit OpenAI).
- Keep `publicRun` / usage summary responses in sync so Profile and generate details see the same fields once 8003 renders them.
- Update `server-webApp` and `server-data` OpenAPI for the new nullable fields. Document that MC/SA are quiz totals while `shortAnswerAiCount` is the non-blank SA subset sent to OpenAI.

### Fallback policy
- No Mongo backfill. Existing rows remain without counts forever.
- API treats missing fields as unknown (`null`), not as zero.

## Out of scope
- Profile / `AiRunDetails` UI (8003).
- Adding an evaluation results-screen AI-run surface.
- Inferring counts by joining old usage rows to quizzes/attempts.
- Changing scoring, prompts, or when evaluation calls the model.
- Showing answer keys, prompts, or learner response text on usage records.
- Model catalogue / pricing refactor (8002).
- Changing pagination or totals aggregates beyond returning the new fields on each recent item.

## Acceptance checks
- [x] New quiz generation (success and AI failure that still logs usage) stores and returns both MC/SA counts; `shortAnswerAiCount` is null.
- [x] New answer evaluation that performs an AI call stores and returns quiz type totals and `shortAnswerAiCount`.
- [x] Pre-existing usage rows still load; new fields serialize as `null` / absent without inventing zeros.
- [x] Description / connectivity / non-AI paths do not require or fake these fields.
- [x] Dual-API: browser still talks only to `server-webApp`; ownership unchanged; no secrets or answer material on the record.
- [x] Both services’ OpenAPI updated for the new nullable fields.
- [x] Focused check: create one generation usage and one evaluation usage; confirm fields on GET usage; confirm an older document without the fields still serialises.

## Implementation notes
- Today’s generation `runContext` is only `{ contextMode, includedChars, sourcesIncluded, sourcesTruncated, sourcesExcluded }` — counts must be added there before `recordUsage`.
- Evaluation `contextCounts(quiz)` likewise omits type totals; AI is only invoked for non-blank short answers (`pending`). Do not imply every short-answer count was model-scored unless `shortAnswerAiCount` is also stored and labelled.
- Prefer nullable integers on the schema (`default: null`) so old documents do not need migration.
- Preview reuses `runContext` and may surface the new fields in preview `context`; that is acceptable and does not write a usage row.
