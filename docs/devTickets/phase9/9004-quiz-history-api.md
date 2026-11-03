# 9004 — Quiz history business API

**Status:** Planned  
**Phase:** 9  
**Depends on:** 9002, 9003 (shared dataApi client)  
**Relevant scope:** F08; S05/S06 quiz detail; study/stats vs player resume

## Objective
Add JWT `GET /quizzes/:quizId/history` that returns paginated evaluated attempts and quiz-level stats (average of last N, distribution, series, weakest questions) shaped for the quiz detail study surface—not for the in-progress player.

## In scope
- Route: `GET /quizzes/:quizId/history` on `server-webApp` (REST-consistent with existing quiz routes).
- Auth: JWT; quiz must be owned by the caller (404 otherwise).
- Query: `page` (default 1), `limit` (default **5**), optional `n` for series/avgLastN (default **10**).
- Call internal study-history with `quizId` and `include=stats,weakestQuestions,attemptSeries`.
- Stable DTO for this screen:
  - Paginated evaluated attempt/result rows (score, percent, submittedAt, attempt id)—no responses or keys.
  - Quiz stats: `avgLastNPercent`, `minPercent`, `maxPercent`, `meanPercent`, `lastPercent`.
  - `attemptSeries` (≤N percents, oldest→newest).
  - `weakestQuestions` (top 5 for this quiz; prompt + score metadata only).
  - `pagination` meta.
- Client: add a feature service method on `client-webApp` that calls this endpoint (no UI wiring yet).
- OpenAPI on `server-webApp`. Document that `GET /quizzes/:quizId/attempts` remains for player/resume (all statuses, no stats aggregates).

## Out of scope
- Quiz detail UI composition (9007).
- Changing attempts list semantics or Start/Resume flows.
- Subject/topic or dashboard endpoints.
- Answer keys or marking criteria in the response.

## Acceptance checks
- [ ] Owner receives paginated evaluated attempts and quiz stats for that quiz; foreign quiz id is 404; no token is 401.
- [ ] Stats use locked definitions (avgLastN, distribution over all evaluated attempts for the quiz, series length n).
- [ ] Weakest questions are quiz-scoped and contain no keys, rubrics, explanations, responses, or snapshots.
- [ ] In-progress attempts do not appear in history rows or affect stats.
- [ ] Client service method can call the route; OpenAPI matches.
- [ ] Focused smoke passes, or limitations are documented.

## Implementation notes
- Reuse the shared study-history dataApi client from 9003; only the public DTO and defaults differ.
- Likely areas: `quizRoutes` / quiz or studyHistory controller-service split—prefer existing quiz route mounting if that matches repo style; keep controllers thin.
