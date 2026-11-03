# 9003 — Evolve dashboard GET /study-history onto data API

**Status:** Done  
**Phase:** 9  
**Depends on:** 9002  
**Relevant scope:** F08; S02 dashboard; 7013 / 7014

## Objective
Keep JWT `GET /study-history` as the dashboard use-case endpoint, but stop aggregating from a full owner dump. Call the enriched data API through one shared internal client and preserve 7014-compatible fields while adding real pagination for recent results.

## In scope
- Shared `server-webApp` dataApi helper for the two 9002 paths (reusable by 9004 and 9005):
  - results: keyed `GET /study-history` (latest-per-quiz rows)
  - attempts: keyed `GET /study-history/attempts` (every evaluated attempt)
- This ticket’s public route uses the **results** path only. Do not page dashboard recent results from `/attempts`.
- Subject ownership check (404 when not owned); `topicId` requires `subjectId` (400 otherwise)—same as today.
- Public response continues to provide: filter echo, counts (`quizzesSaved`, `quizzesAttempted`, `evaluatedAttempts`), activity buckets, weakest topics, weakest questions, `lastStudiedAt`.
- Back `recentResults` with the data API `items` page (`page` / `limit`; dashboard default **limit 5**). For one release, map legacy `recent=1|3|5|all` to an equivalent limit/cap (all → 50) so 7014 does not break mid-phase; document the mapping in OpenAPI.
- Request results-path includes: `stats` (counts + `lastStudiedAt`), `activity`, `weakestQuestions`, `weakestTopics`. Aggregates are filter-wide; do not recompute them from the page.
- Remove dump-then-aggregate logic from `studyHistoryService.js`.
- Live OpenAPI on `server-webApp` for the evolved path.
- No answer keys, rubrics, explanations, responses, or snapshots.

## Out of scope
- New route such as `/dashboard/history` (keep `/study-history`).
- Shared UI primitives or dashboard markup changes (9006, 9008).
- Quiz or subject history routes (9004, 9005).
- Changing `GET /quizzes/:quizId/attempts`.

## Acceptance checks
- [x] Authenticated dashboard call returns 7014-shape fields (counts, activity, weakest lists, lastStudiedAt, recentResults) for the same filter semantics as 7013.
- [x] Recent results are paginated (or legacy `recent` maps correctly); response includes pagination meta when using `page`/`limit`.
- [x] No token → 401; foreign `subjectId` → 404; `topicId` without `subjectId` → 400.
- [x] In-progress / evaluation_failed attempts do not affect counts, activity, weakest, or recent results.
- [x] Service no longer depends on an unfiltered full dump from server-data.
- [x] OpenAPI matches implemented query/response.
- [x] Focused smoke against both APIs passes, or limitations are documented.

## Implementation notes
- Primary files: `server-webApp/src/services/studyHistoryService.js`, `server-webApp/src/services/dataApi/studyHistory.js`, `server-webApp/src/openapi/paths/studyHistory.js`.
- Map public DTO from the results-path envelope: `items` → `recentResults`; `stats` → counts + `lastStudiedAt`; pass through `activity`, `weakestTopics`, `weakestQuestions`, `pagination`.
- 9002 already ships `include=weakestTopics`. Do not extend server-data or reintroduce a dump.
