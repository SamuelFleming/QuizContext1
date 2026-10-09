# P6-01 — Quiz generation API and quiz persistence

**Status:** Planned  
**Phase:** 6  
**Depends on:** P5-01, P5-02  
**Relevant scope:** MVP plan Phase 6 slice 1 and §3 "Separate learning records", "Hidden marking until submit", "Context mode"; F05 steps 2–5; core scope 02 §2.3, §3.3; product theory §5, §7

## Objective
A JWT-protected business route generates a quiz from the caller's subject or topic, validates the structured questions, and stores the quiz with its settings, context mode, and a frozen source snapshot. The saved quiz can be read back without its answer key.

## In scope
- **server-data:** `Quiz` model, repository, controller, and internal routes (create, get by id), scoped by `X-User-Id` like content records. The data API returns the **full** record to `server-webApp` (keys, criteria, snapshot included). Fields:
  - `userId`; `title`; scope: `subjectId`, `topicId` (nullable), plus `subjectName` and `topicPath` captured at generation;
  - settings: `multipleChoiceCount`, `shortAnswerCount`, `difficulty`, `includeDescendants`;
  - `contextMode` and `promptVersion`;
  - `questions[]`, each with `id`, `type`, `prompt`, `concepts[]`, and `sourceRefs[]`. Multiple-choice questions add `options[4]` and `correctOptionIndex`; short-answer questions add `expectedAnswer` and `markingCriteria[]`;
  - `sourceManifest` (P5-01 manifest entries) and `sourceSnapshot` (the `text` `assembleContext` returned, i.e. what was sent to the model);
  - timestamps (`createdAt` / `updatedAt` as on other models).
  Persistence validation covers enums, lengths, and counts. Do **not** cascade subject, topic, or document deletes onto quizzes.
- **Prompt module** (`openai/prompts/quizGeneration.js`): `PROMPT_VERSION` `quiz-generation@1`, operation `quiz_generation`, instructions, JSON schema, and validator. One guidance line per context mode (core scope 03 §3). The validator requires:
  - the exact requested count of each question type;
  - four distinct, non-empty options and a valid correct index for multiple choice;
  - an expected answer and 1–5 marking criteria for short answer;
  - length limits on every text field (Phase 6 README);
  - `sourceRefs` drawn only from manifest ids that were `included` or `truncated`.
- **Service** (`services/quizService.js`):
  - Validate input: total 1–20 questions, `difficulty` `easy|medium|hard`, `contextMode` from `CONTEXT_MODES` (default `targeted`), `includeDescendants` default `true`.
  - Call `assembleContext(userId, { subjectId, topicId, includeDescendants, contextMode })`. If `insufficient`, return 422 `CONTEXT_INSUFFICIENT` and make no AI call and no usage record.
  - Call `runAiOperation` with `promptVersion` and context counts (same shape as P5-02).
  - After validation, shuffle each question's options server-side and remap `correctOptionIndex` so the correct position is not model-order.
  - Title from `assembleContext` `selection.name`. Save the full quiz through server-data.
- **Timeout:** add an optional `timeoutMs` argument to `runAiOperation` (today it always uses `AI_TIMEOUT_MS`, default 20 s). Generation passes `AI_QUIZ_TIMEOUT_MS` (default 60,000).
- **Business routes:**
  - `POST /quizzes` with body `{ subjectId, topicId?, includeDescendants?, multipleChoiceCount, shortAnswerCount, difficulty, contextMode? }`.
  - `GET /quizzes/:quizId`.
  Both return the **study view** only: title, scope names, settings, mode, dates, manifest (titles, paths, and status — no snapshot text), and questions as `id`, `type`, `prompt`, and `options`. Never `correctOptionIndex`, `expectedAnswer`, `markingCriteria`, or `sourceSnapshot`. One projection function in `server-webApp`; the player reuses it later.
- Swagger on both APIs for the routes that exist, including 422 `CONTEXT_INSUFFICIENT` and the existing AI error responses. Data-API Swagger documents the full record; business Swagger documents the study view.

## Out of scope
- Client UI (P6-02).
- Attempts, evaluation, list, delete, and export (P6-03 onward).
- Mode-specific tuning beyond one instruction line per mode. Targeted is the mode that must work.
- Regenerating or editing individual questions.

## Acceptance checks
- [ ] Mocked provider: a topic with notes and a document produces a stored quiz with the requested type counts. The `AiUsage` record shows `quiz_generation`, `promptVersion`, context counts, and `succeeded`.
- [ ] Mocked output with wrong counts, duplicate options, a bad correct index, or an unknown `sourceRef` returns `AI_INVALID_OUTPUT`, stores no quiz, and writes a failed usage record.
- [ ] Insufficient content returns 422 `CONTEXT_INSUFFICIENT` with no AI call and no usage record. Oversized content saves the quiz and the manifest shows truncation.
- [ ] Neither the business `POST` nor `GET` JSON contains a correct index, expected answer, marking criteria, or snapshot text. The data-API get-by-id response does contain those fields.
- [ ] After the source notes are edited and the subject is deleted, business `GET /quizzes/:quizId` still returns the same questions and scope names.
- [ ] User B gets 404 for user A's quiz and for generating from user A's subject. No token gives 401. A body `userId` is ignored.
- [ ] Invalid settings (total 0 or 21, unknown difficulty or mode) return 400 with no AI call.
- [ ] Swagger on both APIs matches the implemented routes.

## Implementation notes
- Follow existing layers: `server-data` `models/` / `repositories/` / `controllers/` / `routes/`; `server-webApp` `services/dataApi/quizzes.js`, `services/quizService.js`, `controllers/`, `routes/`. Mount on both `app.js` files and both OpenAPI indexes.
- `deleteSubject` currently cascades topics and documents only — leave it that way.
- Mock the provider as in P5-02. A real OpenAI call is still unrun (Phase 3 follow-up). Run one here if a key is available; otherwise record the limitation.
- Set `MAX_OUTPUT_TOKENS` high enough for 20 questions (proposed 8,000); the description prompt's 700 is too small.
