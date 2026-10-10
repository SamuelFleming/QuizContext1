# P6-05 — Quiz Results screen

**Status:** Done  
**Phase:** 6  
**Depends on:** P6-04  
**Relevant scope:** MVP plan Phase 6 slice 3; F07 step 5, F08 steps 3–4; S06 "submission or evaluation status"; S07; `docs/design/01_design-concept.md`

## Objective
After submitting, the user sees the overall result and the feedback for each question. They can retry a failed evaluation, return to the quiz, or start another attempt.

## In scope
- `/attempts/:attemptId` renders according to status:
  - `in_progress` shows the player (P6-03);
  - `submitted` or `evaluation_failed` shows a status panel with a "Retry evaluation" button (`POST /attempts/:attemptId/evaluate`);
  - `evaluated` shows results.
- The player's submit shows an evaluation-in-progress state, then results. AI profile errors point to Profile, as in P5-03.
- **Results (S07):**
  - the overall score and percent, with the summary;
  - for each question: the prompt, the learner's answer, the correct option or the expected answer, the result badge, the explanation, missing concepts, and source titles;
  - a line stating that feedback is AI-assisted study help, not official grading;
  - "Back to quiz" and "Try again" actions. "Try again" starts a new attempt through `POST /quizzes/:quizId/attempts`.
- Render learner text and AI explanations safely: plain text, or the existing sanitised Markdown preview (`react-markdown` as in P4-03). Do not render raw HTML.

## Out of scope
- Attempt history lists and comparing attempts (P6-06).
- Charts or analytics.

## Acceptance checks
- [x] Headless browser with a mocked provider: complete a mixed quiz, see the results with per-question feedback, reload, and see the same results.
- [x] A mocked failure shows the failed state. Retry evaluation then shows the results.
- [x] "Try again" opens a fresh attempt. The previous attempt's results are unchanged when reopened by URL.
- [x] A `<script>` tag in a short answer renders as text.
- [x] The 390px layout stays usable. Only theme tokens are used. Lint and build pass.
