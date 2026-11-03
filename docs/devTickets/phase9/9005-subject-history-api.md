# 9005 — Subject/topic history business API

**Status:** Planned  
**Phase:** 9  
**Depends on:** 9002, 9003  
**Relevant scope:** F08; S03 Content Workspace; 8009 / 8010 follow-on

## Objective
Add JWT `GET /subjects/:subjectId/history` with optional `topicId` query so the workspace can load scoped counts, stats, and paginated recent results without using the fat dashboard contract or awkward compound path segments.

## In scope
- Route: `GET /subjects/:subjectId/history?topicId=` on `server-webApp`.
- Auth: JWT; subject ownership (404 when not owned). Optional `topicId` uses 7013 matching (requires belonging to that subject; whole-subject quizzes excluded from topic filter).
- Defaults suited to workspace: `page` default 1, `limit` default **3**.
- Call internal study-history with subject/topic filters and includes for counts/stats and optional compact weakest (when cheap).
- Stable DTO:
  - Counts (`quizzesSaved`, `quizzesAttempted`, `evaluatedAttempts`) and `lastStudiedAt`.
  - Scope stats: `avgPercent` (latest-per-quiz mean), distribution over all evaluated attempts in scope.
  - Paginated **recent results** (latest evaluated attempt per quiz, newest first)—not a second quiz-list API.
  - Optional compact `weakestQuestions` / `weakestTopics` when included without large cost.
  - `pagination` meta; filter echo.
- Quiz list for the workspace stays on existing `GET /quizzes` (`ScopeQuizList`); this endpoint does not replace it.
- Client service method only (UI wiring in 9008).
- OpenAPI on `server-webApp`.
- No answer keys, rubrics, explanations, responses, or snapshots. No activity chart payload required.

## Out of scope
- Workspace or dashboard UI changes (9008).
- Activity buckets (dashboard-only via 9003).
- Mega StudyHistoryWidget.
- Changing `GET /quizzes` pagination.

## Acceptance checks
- [ ] Subject scope returns counts/results for that subject; topic filter excludes whole-subject and other-topic quizzes.
- [ ] Default page size is 3; pagination meta is correct.
- [ ] Foreign subject → 404; no token → 401; invalid topic/subject pairing → 400 or 404 per existing ownership patterns.
- [ ] Response has no keys/rubrics/snapshots; in-progress attempts ignored.
- [ ] Client service method exists; OpenAPI matches.
- [ ] Focused smoke passes, or limitations are documented.

## Implementation notes
- Reuse shared dataApi client from 9003. Mount under subject routes for REST consistency.
- `ScopeStudySummary` continues on legacy `getStudyHistory` until 9008 switches it to this endpoint.
