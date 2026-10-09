# P6-02 — Quiz generation form and saved quiz detail

**Status:** Planned  
**Phase:** 6  
**Depends on:** P6-01  
**Relevant scope:** MVP plan Phase 6 slice 1; F05; S03 "initiate quiz generation"; S05 generation and saved-quiz functions; `docs/design/01_design-concept.md`

## Objective
The user starts quiz generation from the Content Workspace (or from Quizzes), configures it, generates it, and lands on the saved quiz's detail view.

## In scope
- Client `services/quizService.js` with calls for `POST /quizzes` and `GET /quizzes/:quizId`.
- Feature folder `features/quizzes/` (generation form and detail). Extend the existing manual matching in `AppRoutes`:
  - `/quizzes/new` for the generation form, prefilled when opened from the workspace selection (query `subjectId` / `topicId`);
  - `/quizzes/:quizId` for the detail view.
  Match `/quizzes/new` **before** the param route. `/quizzes` stays a placeholder until P6-06, except add a "Generate quiz" link to `/quizzes/new`.
- Workspace: a "Generate quiz" action on the selected subject or topic, which navigates to the form with that selection.
- **Generation form (S05):**
  - subject and topic picker, using the existing subject and topic services;
  - an "Include subtopics" toggle (default on);
  - multiple-choice and short-answer counts (total 1–20, default 6 and 4);
  - difficulty (default medium);
  - context mode (default Targeted, all three values selectable).
  Client-side validation mirrors the server. The form shows a loading state and disables submit while generation runs.
- **Errors:** reuse the P5-03 pattern. `CONTEXT_INSUFFICIENT` asks the user to add notes or documents. Profile codes (`AI_KEY_MISSING`, `AI_LIMIT_REACHED`, `AI_DISABLED`, `AI_AUTH_FAILED`) point to Profile. Other AI errors show the server message. Form values are kept after a failure.
- **Detail view (S05):** title, scope, mode, difficulty, type counts, created date, and a "Based on N sources" summary with the truncation notice from the manifest (titles and status, as in `DescriptionSuggestion`). The question list shows prompts and multiple-choice options without marking which option is correct. A "Start attempt" button is present but disabled until P6-03.

## Out of scope
- Attempts and the player (P6-03), results (P6-05), library, history, delete, and export (P6-06).
- Showing the answer key on the detail view. It appears in results and in the export.

## Acceptance checks
- [ ] Headless browser with a mocked provider: from a nested topic in the workspace, generate a quiz and land on its detail view, which shows the settings and questions.
- [ ] An empty subject shows the insufficient-content message, and no quiz is created.
- [ ] With AI disabled or no user key, the error and the Profile pointer show.
- [ ] A truncated selection shows the partial-inclusion notice on the detail view.
- [ ] The network response and the DOM on the detail view contain no correct answers or marking criteria.
- [ ] Reloading `/quizzes/:quizId` shows the same quiz. Another user's quiz id shows a not-found state.
- [ ] The 390px layout stays usable. Only theme tokens are used. Lint and build pass.
