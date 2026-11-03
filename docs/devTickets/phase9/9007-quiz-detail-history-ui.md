# 9007 — Compose quiz detail history and stats

**Status:** Planned  
**Phase:** 9  
**Depends on:** 9004, 9006  
**Relevant scope:** F08; quiz detail (S05/S06 adjacent)

## Objective
On quiz detail, show a narrow paginated attempts list, quiz-level stats (completion circle, distribution, last-N series), and weakest questions for that quiz—fed by `GET /quizzes/:quizId/history`.

## In scope
- Update `QuizDetailPage` (or adjacent feature components under `features/quizzes/`) to:
  - Load quiz history via the 9004 client service (`page` / `limit` default 5, `n` default 10).
  - Render **PaginatingQueryList** for evaluated attempts (narrow column); row select navigates to existing attempt results routes.
  - Render **ScoreCompletionCircle**, **ScoreDistributionPlot**, and **AttemptSeriesChart** from the history DTO.
  - Render quiz-scoped **weakest questions** (prompt + average score + times answered; link to latest attempt when useful).
- Explicit loading, empty (no evaluated attempts), and error states.
- Keep Start / Resume flows on `GET /quizzes/:quizId/attempts` (or existing attempt create) unchanged where they already work.
- No answer keys, rubrics, explanations, or response text on this surface.

## Out of scope
- Dashboard or workspace composition (9008).
- Changing evaluation or the quiz player before submit.
- Rewriting the questions list card beyond layout needed to fit the new history column.

## Acceptance checks
- [ ] Quiz with multiple evaluated attempts shows paginated list, stats visuals, and weakest questions from the history API.
- [ ] Empty evaluated history shows a clear empty state; loading/error do not break the rest of the page.
- [ ] Pagination changes page without full-page navigation bugs; rows link to attempt results.
- [ ] UI and network payloads expose no keys, criteria, explanations, or snapshots.
- [ ] Client lint and production build pass. Narrow viewport (~390px) keeps the history column usable.

## Implementation notes
- Current attempts block in `QuizDetailPage.jsx` uses unpaginated `listQuizAttempts`; replace the study/stats list with history API while leaving in-progress resume discovery intact if still required from attempts.
