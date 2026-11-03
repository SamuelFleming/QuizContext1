# 9003 — Evolve dashboard GET /study-history onto data API

**Status:** Planned  
**Phase:** 9  
**Depends on:** 9002  
**Relevant scope:** F08; S02 dashboard; 7013 / 7014

## Objective
Keep JWT `GET /study-history` as the dashboard use-case endpoint, but stop aggregating from a full owner dump. Call the enriched data API through one shared internal client and preserve 7014-compatible fields while adding real pagination for recent results.

## In scope
- Shared `server-webApp` dataApi helper for study-history that maps filters, pagination, and `include` flags to the 9002 contract (reusable by 9004 and 9005).
- Subject ownership check (404 when not owned); `topicId` requires `subjectId` (400 otherwise)—same as today.
- Public response continues to provide: filter echo, counts (`quizzesSaved`, `quizzesAttempted`, `evaluatedAttempts`), activity buckets, weakest topics, weakest questions, `lastStudiedAt`.
- Back `recentResults` with paginated data (`page` / `limit`; dashboard default **limit 5**). For one release, map legacy `recent=1|3|5|all` to an equivalent limit/cap (all → 50) so 7014 does not break mid-phase; document the mapping in OpenAPI.
- Request data API with includes needed for the dashboard DTO (`stats` as required for counts, `activity`, `weakestQuestions`, and whatever backs weakest topics).
- Remove dump-then-aggregate logic from `studyHistoryService.js`.
- Live OpenAPI on `server-webApp` for the evolved path.
- No answer keys, rubrics, explanations, responses, or snapshots.

## Out of scope
- New route such as `/dashboard/history` (keep `/study-history`).
- Shared UI primitives or dashboard markup changes (9006, 9008).
- Quiz or subject history routes (9004, 9005).
- Changing `GET /quizzes/:quizId/attempts`.

## Acceptance checks
- [ ] Authenticated dashboard call returns 7014-shape fields (counts, activity, weakest lists, lastStudiedAt, recentResults) for the same filter semantics as 7013.
- [ ] Recent results are paginated (or legacy `recent` maps correctly); response includes pagination meta when using `page`/`limit`.
- [ ] No token → 401; foreign `subjectId` → 404; `topicId` without `subjectId` → 400.
- [ ] In-progress / evaluation_failed attempts do not affect counts, activity, weakest, or recent results.
- [ ] Service no longer depends on an unfiltered full dump from server-data.
- [ ] OpenAPI matches implemented query/response.
- [ ] Focused smoke against both APIs passes, or limitations are documented.

## Implementation notes
- Primary files: `server-webApp/src/services/studyHistoryService.js`, `server-webApp/src/services/dataApi/studyHistory.js`, `server-webApp/src/openapi/paths/studyHistory.js`.
- Weakest topics may be derived from data-API stats/rows if 9002 exposes enough; if not, extend 9002 in this ticket only as needed for dashboard parity—prefer extending the data include rather than reintroducing a dump.
