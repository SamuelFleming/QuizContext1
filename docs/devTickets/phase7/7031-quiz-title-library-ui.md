# 7031 — Quiz title and scalable library UI

**Status:** Approved
**Phase:** 7
**Depends on:** 7030
**Relevant scope:** F05; S04; S05; `04_flows-to-screens.md` §7.3; `01_design-concept.md`

## Objective
Let a user optionally name a generated quiz and browse a large quiz library with topic and question-count filters, stable sorting, and server-driven pagination.

## In scope
- Add an optional **Quiz title** field to `/quizzes/new`. Trim it before generation, limit it to 120 characters, and omit it from the generation body when blank so the API retains the scope-derived default.
- Explain the fallback beside the field without presenting the generated scope title as guaranteed editable data. The title is a saved label only and is not sent to preview or shown as AI prompt content.
- Preserve the entered title and all existing form values while previewing, generating, after success, and after a typed AI or validation failure.
- Update the client quiz service to:
  - Send a non-blank title to `POST /quizzes`.
  - Build encoded list queries for `page`, fixed `limit`, `sort`, repeated `topicIds`, `questionCount`, `multipleChoiceCount`, and `shortAnswerCount`.
  - Consume the `{ items, pagination }` list response from 7030.
- Keep Dashboard's Recent quizzes section at the newest five by adapting its request and response handling to page 1, limit 5. Do not add library filters or pagination to Dashboard.
- Add library controls for:
  - Topic selection: choose a subject only to load its topic tree/options, then select one or more topics from that subject. The subject choice alone does not filter quizzes. Changing subject clears selected topics.
  - Exact total question count.
  - Exact multiple-choice question count.
  - Exact short-response question count.
  - Sort: Newest (default), Oldest, Question count low to high, and Question count high to low.
- Provide an explicit **Clear filters** action. Clear topic and count filters, restore Newest, and return to page 1.
- Request filtered and sorted pages from the API; do not fetch all quizzes for client-side filtering or sorting. Use a fixed page size of 25 in the library.
- Reset to page 1 whenever a filter or sort changes. Avoid stale responses replacing newer selections when requests overlap.
- Show Previous and Next below the list with “Page X of Y”; hide pagination controls when there is at most one page and disable unavailable directions.
- Distinguish the existing never-created-a-quiz state from “No quizzes match these filters.” Keep loading, request error, and 401/sign-out behavior explicit.
- Keep Open, Export, and Delete working on every page. After deletion, refresh the active query and move to the preceding page when the deleted item was the last item on a now-empty later page.
- Reuse current form, `history-filters`, item-list, and pagination styling patterns. Controls and rows must remain labelled, keyboard usable, and free of horizontal overflow at 390px.

## Out of scope
- Renaming an existing quiz.
- Subject as a quiz filter; the subject selector exists only to load topic choices.
- Title search, difficulty, context/focus mode, date, attempt, score, or result filters.
- Filter ranges, “at least/at most” count controls, a page-size selector, numbered-page buttons, or infinite scroll.
- Persisting filters, sort, or page in the URL or across sessions.
- Changing Dashboard beyond adapting its existing five-item request.
- New quiz-generation progress, retry, export, attempt, or result behavior.
- Backend/API work from 7030.

## Likely implementation areas
- `client-webApp/src/features/quizzes/QuizGeneratePage.jsx`
- `client-webApp/src/features/quizzes/QuizzesHome.jsx`
- `client-webApp/src/services/quizService.js`
- `client-webApp/src/features/dashboard/Dashboard.jsx`
- `client-webApp/src/services/subjectService.js`
- `client-webApp/src/services/topicService.js`
- `client-webApp/src/styles/app.css`

## Acceptance checks
- [ ] A non-blank title is trimmed and sent only with the generation request. Blank input generates successfully with the current scope-derived title.
- [ ] The optional field enforces 120 characters, has an associated label and fallback help, and retains its value through preview, generation, success, and failure states.
- [ ] A custom or default title appears through the existing library, detail, player/results, Dashboard, delete confirmation, and export flows without additional client-side title derivation.
- [ ] The library initially requests page 1, limit 25, newest first and renders the returned pagination metadata. Dashboard still shows at most the five newest quizzes.
- [ ] Selecting one or more topics sends repeated topic IDs and returns quizzes involving any selected topic. Choosing a subject without topics does not change quiz results, and changing subject clears prior topic selections.
- [ ] Total, multiple-choice, and short-response exact-count filters work separately and in valid combinations. The UI prevents or explains impossible combinations before sending a request.
- [ ] All four sort choices return to page 1 and display the server order. Filter and sort changes do not allow stale responses to replace the latest results.
- [ ] Previous and Next navigate without overlapping rows, have correct disabled states, and are hidden for zero or one page.
- [ ] Clear filters restores the unfiltered newest list and page 1.
- [ ] No saved quizzes and no matching filtered quizzes show distinct guidance. Loading, API failure, and 401 states remain explicit.
- [ ] Open, Export, and Delete work from a filtered page. Deleting the final item on a later page moves to the preceding valid page rather than leaving a stale empty page.
- [ ] Controls, result rows, actions, and pagination fit and remain keyboard usable at 390px.
- [ ] Client lint and production build pass with no new warnings or errors.

## Implementation notes
`QuizzesHome` currently loads one unbounded array. `UsagePanel` provides the existing Previous/Next pattern, and `StudyHistorySection` provides the existing subject/topic filter layout. A dedicated library-filter component is optional if it keeps `QuizzesHome` readable; do not introduce a general UI framework.
