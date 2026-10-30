# 9002 — Enriched study-history data API

**Status:** Done  
**Phase:** 9  
**Depends on:** None (9000–9001 done)  
**Relevant scope:** F08; 7013 revision; dual-API data boundary

## Objective
Replace the owner-wide study-history dump on `server-data` with one configurable, owner-scoped read that filters, paginates, and optionally returns stats—so business endpoints do not load every quiz and attempt into memory.

## In scope
- Evolve internal `GET /study-history` (keyed + `X-User-Id`) into a data-access API:
  - Filters (optional): `subjectId`, `topicId`, `quizId`. Topic matching stays 7013 rules (`topicId` or `topicIds` membership; whole-subject quizzes excluded from a topic filter).
  - Pagination: `page` (default 1), `limit` (max 100), response `pagination: { page, limit, totalItems, totalPages }`.
  - Sort: newest evaluated `submittedAt` first for result/attempt rows.
  - Optional `include` flags: `stats`, `weakestQuestions`, `weakestTopics`, `attemptSeries`, `activity`. Series length `n` default **10**.
- Default status: **evaluated attempts only**. Ignore `in_progress` / `evaluation_failed`.
- When `include` omits expensive bits, return the filtered paginated rows (and identity fields) without computing unused aggregates.
- **Stats definitions** (stored percents/scores only):
  - Scope `avgPercent` (when scope is user/subject/topic): mean of **latest-per-quiz** percents.
  - Quiz `avgLastNPercent`: mean of last ≤N evaluated attempt percents.
  - Distribution: `minPercent`, `maxPercent`, `meanPercent`, `lastPercent` over **all** evaluated attempts in the active filter.
  - `attemptSeries`: last ≤N percents, oldest→newest.
  - Counts as needed by callers (quizzes in scope, evaluated attempts, quizzes attempted).
- **Weakest questions** (when included): top 5 by average stored per-question score ascending, then times answered; prompt + score metadata only.
- **Activity** (when included): 7013 UTC buckets (daily for 7; Monday-start weekly for 30/90).
- Prefer Mongo-side filter/count/pagination over load-all-then-filter.
- Live OpenAPI on `server-data` for implemented behaviour only.
- No answer keys, marking criteria, explanations, learner responses, or source snapshots.

## Out of scope
- OpenAI, quiz scoring, or re-marking.
- `server-webApp` public routes or client UI (9003+).
- New study-history collection or backfill job.
- Browser access to this endpoint.

## Acceptance checks
- [x] Owner-scoped filters for subject, topic, and quiz return only that user's rows; another user's ids do not leak data.
- [x] Pagination totals and page slices match Mongo counts for the same filter; `limit` above max is rejected or capped per existing quiz-list pattern.
- [x] With no expensive `include` flags, the response does not require computing weakest/activity/series.
- [x] With `include` set, stats/weakest/series/activity match the locked definitions above; in-progress attempts never affect them.
- [x] Weakest question rows expose prompt and scores only—no keys, rubrics, explanations, responses, or snapshots.
- [x] `server-data` OpenAPI matches the implemented query and response.
- [x] Focused request smoke or repository checks pass, or limitations are documented.

## Implementation notes
- Shipped as **two** keyed GETs sharing one repository (approved deviation from a single overloaded path):
  - `GET /study-history` — latest evaluated attempt per in-scope quiz; `totalItems` is those quizzes.
  - `GET /study-history/attempts` — every evaluated attempt in the filter; `totalItems` is those attempts.
- `quizId` is a filter on both paths, not a mode switch. Includes (`stats`, `weakestQuestions`, `weakestTopics`, `attemptSeries`, `activity`) are opt-in and always filter-wide.
- Dump helpers `listQuizzesForHistory` / `listEvaluatedAttempts` and the history-source mappers were removed.
- This **breaks** the 7013 internal dump contract. Ticket **9003** must remount public `GET /study-history` (calling the results path) before dashboard UAT. **9004** should call `GET /study-history/attempts`.
- Mirror pagination envelope from `GET /quizzes` (`QuizPagination` style). `limit > 100` is rejected.
