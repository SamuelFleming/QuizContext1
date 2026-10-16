# P6-03 — Attempts and the Quiz Player

**Status:** Planned  
**Phase:** 6  
**Depends on:** P6-01, P6-02  
**Relevant scope:** MVP plan Phase 6 slice 2 and §3 "Hidden marking until submit", "Separate learning records"; F06; S06

## Objective
The user starts an attempt on a saved quiz, answers multiple-choice and short-answer questions in the player, and submits. The responses are saved as a separate attempt record. The player never receives the answer key.

## In scope
- **server-data:** `Attempt` model, repository, controller, and internal routes (create, get, update responses, set status), scoped by `X-User-Id`. Creating an attempt checks that the quiz belongs to the same user. Fields:
  - `quizId` and `status`: `in_progress`, `submitted`, `evaluated`, or `evaluation_failed`. All four values are defined now; P6-04 uses the last two;
  - `responses[]`: `{ questionId, selectedOptionIndex | text }`;
  - `startedAt` and `submittedAt`;
  - an `evaluation` slot, empty until P6-04.
  Data API returns the full attempt to `server-webApp`.
- **Business routes:**
  - `POST /quizzes/:quizId/attempts` returns the existing `in_progress` attempt for that quiz if there is one; otherwise it creates one.
  - `GET /attempts/:attemptId`.
  - `PATCH /attempts/:attemptId` saves responses. Only allowed while `in_progress`.
  - `POST /attempts/:attemptId/submit` validates and saves the final responses, sets `submitted`, and records `submittedAt`. Blank answers are allowed. This ticket does **not** evaluate.
- Response validation: question ids must belong to the quiz. A selected option index is 0–3. Short-answer text is at most 2,000 characters. A second submit returns 409.
- **Player payload:** the attempt plus the P6-01 study-view questions. No correct index, expected answer, criteria, or snapshot appears on start, get, patch, or submit in this ticket.
- **Client player (S06)** at `/attempts/:attemptId` in `features/quizzes/`:
  - one question at a time, with question navigation and a progress indicator;
  - radio inputs for multiple choice and a textarea for short answer;
  - keyboard-accessible controls.
  Responses are saved when the user moves between questions and before submit. A confirm step lists unanswered questions. Warn before leaving an unsubmitted attempt (`beforeunload` plus in-app confirm, same idea as the notes editor). A submitted attempt shows a "Submitted" state; P6-05 replaces that with results.
- Enable "Start attempt" on the quiz detail view (`POST /quizzes/:quizId/attempts`, then navigate to the player).
- Swagger on both APIs for the attempt routes.

## Out of scope
- Marking and feedback (P6-04), the results screen (P6-05), attempt history lists (P6-06).
- Timers, shuffling question order per attempt, and partial-credit rules.

## Acceptance checks
- [ ] Headless browser: start an attempt, answer both question types, reload mid-attempt and see the answers kept, then submit. The stored attempt has status `submitted` and the responses.
- [ ] The raw JSON from the start, get, patch, and submit routes contains no correct index, expected answer, marking criteria, or snapshot.
- [ ] Starting again while an attempt is in progress returns the same attempt. After submit, starting creates a new attempt, and the first attempt is unchanged.
- [ ] Patching or submitting an already submitted attempt returns 409. An unknown question id or an out-of-range option returns 400.
- [ ] User B gets 404 on user A's quiz attempts and attempt ids. No token gives 401.
- [ ] Navigating away mid-attempt prompts for confirmation. The 390px layout stays usable. Lint and build pass.
- [ ] Swagger on both APIs matches the implemented routes.
