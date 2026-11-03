# 9017 — Raise quiz instructions character limit to 4,000

**Status:** Done  
**Phase:** 9  
**Depends on:** 9000, 9001  
**Relevant scope:** F05 / S05 quiz generation; optional learner preferences

## Objective
Raise the optional `quizInstructions` budget from 2,000 to 4,000 characters so longer learning outcomes and exam-prep notes fit without changing prompt behaviour.

## In scope
- Set `QUIZ_INSTRUCTIONS_MAX` to 4,000 on `server-data`, `server-webApp`, and the generation form.
- Update both APIs' OpenAPI `quizInstructions` `maxLength` and the generate-path description that names the limit.
- Keep blank/absent instructions on the unchanged `quiz-generation@1` path; non-empty still uses `quiz-generation@2`.

## Out of scope
- Prompt, schema, or subordination-rule changes; presets; regeneration; editing historical instructions; raising other 2,000-character caps (descriptions, topic path, attempt responses, expected answers).
- Mongo migration or backfill.

## Acceptance checks
- [x] Client textarea `maxLength`, character count, and pre-submit check use 4,000.
- [x] Business and data APIs return 400 for over-4,000-character `quizInstructions` before any AI call; length 4,000 is accepted at the validation boundary.
- [x] Blank/absent instructions still resolve to `quiz-generation@1`; OpenAPI on both APIs documents `maxLength` 4000.
- [x] Existing quizzes under the old limit remain valid; no other 2,000 caps change.
- [x] Focused syntax/OpenAPI/client checks pass or limitations are documented.

## Implementation notes
- Primary constants: `server-data/src/constants/content.js`, `server-webApp/src/constants/validation.js`, `client-webApp/src/features/quizzes/QuizGeneratePage.jsx`.
- Mongoose and service/controller checks already import the constant; OpenAPI `maxLength` values are hard-coded and must be updated separately.

## Outcome notes
- `QUIZ_INSTRUCTIONS_MAX` is 4,000 on both servers and the generation form; Mongoose/service checks pick it up via the constant.
- OpenAPI: data `QuizInput`, webApp `QuizPreviewInput` / `QuizStudyView`, and generate-path description all say 4000.
- Boundary script: length 4000 accepted, 4001 rejected, blank → null. OpenAPI assertions and client production build pass. Live HTTP preview/generate smoke not run (servers not required for this constant change).
