# 7030 — Quiz titles and scalable library API

**Status:** Complete
**Phase:** 7
**Depends on:** 7010
**Relevant scope:** F05; S04; S05; P6-01; P6-06; 7017

## Objective
Let a user give each generated quiz its own title and query a large owner-scoped quiz library without loading every quiz. Multiple quizzes may continue to share the same subject or topic scope.

## In scope
- `POST /quizzes` accepts an optional `title`. Trim a supplied title and enforce the existing `CONTENT_NAME_MAX` limit of 120 characters. A missing, null, empty, or whitespace-only title keeps the current scope-derived title.
- The title changes only the saved quiz label. It does not enter the AI prompt, alter context selection, or affect generation. `POST /quizzes/preview` is unchanged.
- Keep quiz titles non-unique. Two or more quizzes with the same `subjectId`, `topicId`, or `topicIds` must coexist and may have the same or different titles.
- Replace the unbounded `GET /quizzes` result with `{ items, pagination }`. The public API defaults to page 1 and limit 25, and caps limit at 25. The internal data API independently validates the same query and caps limit at 100.
- `pagination` contains `page`, `limit`, `totalItems`, and `totalPages`. An empty page is valid and returns an empty `items` array with accurate totals.
- Support stable sort values `newest`, `oldest`, `question_count_asc`, and `question_count_desc`. Default to `newest`. Date sorts use `createdAt` then `_id`; count sorts use total question count, then `createdAt`, then `_id`.
- Support exact integer filters:
  - `questionCount`: 1–20.
  - `multipleChoiceCount`: 0–20.
  - `shortAnswerCount`: 0–20.
  - Combined count filters must be internally possible and remain within the 1–20 total-question constraint; impossible combinations return 400 rather than an unexplained empty page.
- Support `topicIds` as a repeated query parameter with one to 30 unique non-empty topic IDs. Multiple selected topics use OR semantics. A quiz matches when any requested ID equals its stored `topicId` or appears in its stored `topicIds`. Whole-subject quizzes do not match a topic filter.
- All filtering, counting, sorting, and pagination happen in `server-data` and remain scoped to the trusted `X-User-Id`. The business API takes identity only from the JWT and forwards the validated query through the protected internal channel.
- Page the quiz query before loading attempt summaries. Attempt counts and latest evaluated results are calculated only for quizzes on the requested page.
- Extend the summary projection only where the library needs additional safe fields. Do not expose questions, expected answers, marking criteria, source snapshots, or other answer-key data.
- Update Swagger/OpenAPI for both APIs with the title input, list query parameters and bounds, sort enum, paginated response, and 400 responses.

## Out of scope
- Renaming an existing quiz or adding a quiz update route.
- Title search, subject filtering, difficulty filtering, context/focus-mode filtering, date ranges, or attempt/result filters.
- Range-based question-count filters or a configurable page-size control in the client.
- Changing quiz generation, AI prompts, context assembly, attempts, evaluation, study history, exports, or deletion semantics.
- A new uniqueness constraint, new collection, search service, or speculative aggregation framework.
- Frontend controls; those are 7031.

## Likely implementation areas
- `server-webApp/src/services/quizService.js`
- `server-webApp/src/controllers/quizController.js`
- `server-webApp/src/services/dataApi/quizzes.js`
- `server-webApp/src/openapi/components.js`
- `server-webApp/src/openapi/paths/quizzes.js`
- `server-data/src/controllers/quizController.js`
- `server-data/src/repositories/quizRepository.js`
- `server-data/src/models/quiz.js`
- `server-data/src/openapi/components.js`
- `server-data/src/openapi/paths/quizzes.js`

## Acceptance checks
- [x] A supplied title is trimmed, stored, and returned consistently by generate, list, detail, study view, and export. A title over 120 characters returns 400 before the AI call.
- [x] Missing, null, empty, and whitespace-only titles retain the current scope-derived title. Title text is not added to the AI input.
- [x] At least two quizzes can be generated for the same whole subject, single topic, and explicit topic set without replacement or a uniqueness error.
- [x] Default list requests return the first 25 owner-scoped quizzes newest first with correct pagination metadata. Stable adjacent pages do not overlap.
- [x] Public limit 26, internal limit 101, invalid pages, unknown sort values, malformed topic IDs, duplicate topic IDs, and invalid or impossible count combinations return 400.
- [x] Oldest and both question-count sort directions return the expected stable order.
- [x] Each exact count filter works alone and in valid combinations.
- [x] A multi-topic filter uses OR semantics across requested IDs, matches both `topicId` and `topicIds`, and excludes whole-subject quizzes.
- [x] Another user's quizzes never appear in items or totals. Missing authentication remains 401, and the data API still requires its internal key and trusted owner header.
- [x] Attempt summaries are loaded only for the returned page. The list and study responses contain no answer keys, marking criteria, source snapshot, or API credentials.
- [x] Both live OpenAPI documents match the implemented request bounds and paginated response.
- [x] Focused request checks cover custom/default titles, pagination, every filter and sort, validation failures, and cross-user isolation.

## Implementation notes
The quiz schema already stores a required title, `multipleChoiceCount`, `shortAnswerCount`, `topicId`, and `topicIds`, and it has no scope uniqueness constraint. This ticket changes generation input and library querying; it does not require a migration. Preserve the existing dashboard use case by allowing `limit=5` with the default first page.
