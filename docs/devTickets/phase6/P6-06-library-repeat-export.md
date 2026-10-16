# P6-06 — Quiz Library, attempt history, delete, export, and dashboard activity

**Status:** Done  
**Phase:** 6  
**Depends on:** P6-05  
**Relevant scope:** MVP plan Phase 6 slice 4, deliverable, and "Done when"; F08, F09; S02, S04, S05 "view previous attempts / export"

## Objective
The user browses their saved quizzes, reviews past attempts, repeats or deletes a quiz, and downloads a portable export. The Dashboard shows recent quizzes and attempts. This closes Phase 6 and the MVP learning cycle.

## In scope
- **server-data:** list quizzes (newest first, optional `limit`), delete a quiz together with its attempts, list a quiz's attempts, and list the user's recent attempts across quizzes. All scoped by `X-User-Id`. List projections omit questions and the snapshot. Subject/topic/document delete still must not touch quizzes.
- **Business routes:**
  - `GET /quizzes?limit=` returns each quiz's id, title, scope names, mode, difficulty, question count, created date, attempt count, and latest evaluated result (or null).
  - `DELETE /quizzes/:quizId` (attempts go with it; content is untouched).
  - `GET /quizzes/:quizId/attempts` returns each attempt's id, status, dates, and score.
  - `GET /attempts?limit=` lists recent attempts with the quiz title.
  - `GET /quizzes/:quizId/export` returns `{ filename, markdown }` in the normal `{ data }` envelope (the client `apiClient` always parses JSON). The Markdown contains title, scope, mode, settings, and date; the questions and options; then an "Answer key" section with correct options, expected answers, criteria, and source titles. No snapshot text and no attempts.
- **Client:**
  - The Quiz Library (S04) replaces the `/quizzes` placeholder. List with scope and mode, plus open, export, and delete. Delete asks for confirmation and states that attempts are removed too. "Generate quiz" button and an empty state.
  - Quiz detail (S05) adds the previous-attempts list (link to results, or resume `in_progress`) and an Export button that saves the Markdown file in the browser.
  - Dashboard (S02) adds recent quizzes and recent attempts (up to 5 each) and a "Generate quiz" quick action. The existing subjects list stays.
- Swagger on both APIs for the new routes.
- **Phase close-out:** update the Phase 6 README, the queue, `devCompletion.md`, and the MVP plan status line.

## Out of scope
- Filtering, search, sorting options, and pagination beyond `limit`.
- Export formats other than Markdown, and importing.
- Analytics, spaced repetition, and sharing.

## Acceptance checks
- [x] Headless browser, full phase path with a mocked provider:
  1. Generate a Targeted quiz.
  2. Complete both question types and read the feedback.
  3. Open the quiz from the Library and see the attempt.
  4. Try again and submit a second attempt; both attempts are listed with their own scores.
  5. Export, and confirm the file contains the questions and the answer key (no snapshot).
- [x] Editing source notes after generation leaves the quiz, both attempts, and the export unchanged.
- [x] Deleting a quiz removes it and its attempts. The subject content is untouched. Deleting the subject leaves the quiz in the library.
- [x] The Dashboard shows recent quizzes and attempts and links to them. The subjects list still works.
- [x] User B's list, attempts, export, and delete calls never return or affect user A's data (404 by id). No token gives 401.
- [x] Swagger on both APIs documents every quiz, attempt, and evaluation route that exists.
- [x] The 390px layout stays usable. Lint and build pass. Opening the Content Workspace still works.
