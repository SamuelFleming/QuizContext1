# P6-04 — Attempt evaluation: deterministic multiple choice and AI short answer

**Status:** Done  
**Phase:** 6  
**Depends on:** P6-03  
**Relevant scope:** MVP plan Phase 6 slice 3 and §3 "Context mode", "Failure isolation"; F07; core scope 02 §2.4; product theory §6

## Objective
Submitting an attempt marks multiple choice by comparison with the stored correct option. It evaluates short answers with one AI call against the stored expected answers, marking criteria, the quiz's frozen source snapshot, and its context mode. The feedback is stored on the attempt.

## In scope
- **Evaluation service** (`services/evaluationService.js`), run by `POST /attempts/:attemptId/submit` after the responses are saved:
  - Multiple choice scores 1 or 0 from `correctOptionIndex`, with a short deterministic explanation and the question's `sourceRefs`. No AI.
  - A blank short answer is `incorrect` (score 0) with no AI.
  - Remaining short answers are evaluated in **one** `runAiOperation` call per attempt (operation `answer_evaluation`). If there are none, no AI call is made.
  - Do **not** call `assembleContext`. Use the quiz's `sourceSnapshot`, `sourceManifest`, and `contextMode`.
- **Prompt module** (`openai/prompts/answerEvaluation.js`), `answer-evaluation@1`. The input contains:
  - the quiz's `contextMode` guidance line (same mode lines as generation);
  - each short-answer question with its prompt, expected answer, and marking criteria;
  - the learner's response, labelled as untrusted text;
  - the quiz `sourceSnapshot`, already labelled as untrusted source data.
  The instructions credit conceptually correct wording, identify missing concepts and misunderstandings, and frame the output as study feedback.
- **Validator:** exactly one entry per evaluated question id; `result` is `correct`, `partial`, or `incorrect`; explanation at most 1,000 characters; `missingConcepts` at most 5 items; `sourceRefs` must come from the quiz manifest (`included` or `truncated`).
- **Stored evaluation** on the attempt:
  - per question: `result`, `score` (1, 0.5, or 0), `explanation`, `missingConcepts[]`, and `sourceRefs[]`;
  - overall: `score`, `maxScore`, `percent`, and a short **derived** `summary` (no second AI call);
  - `promptVersion` and `evaluatedAt`.
  On success the status becomes `evaluated`.
- **Failure:** if the AI call fails or its output is invalid, the responses are kept, no partial evaluation is stored, the status becomes `evaluation_failed`, and the typed AI error is returned. `POST /attempts/:attemptId/evaluate` retries an attempt in `submitted` or `evaluation_failed` and returns 409 otherwise.
- **Results payload:** an `evaluated` attempt from `GET /attempts/:attemptId` or from submit includes, per question, the learner's response, the correct option or the expected answer and criteria, the feedback, and source titles resolved from the manifest. The snapshot text is still never returned. `GET /quizzes/:quizId` stays the study view.
- Swagger on both APIs for the changed and new routes, including the AI error responses.

## Out of scope
- The results UI (P6-05).
- Re-evaluating an already `evaluated` attempt, and manual overrides of marks.
- Re-reading live content at evaluation time.

## Acceptance checks
- [x] A multiple-choice-only quiz is evaluated on submit with no AI call and no usage record.
- [x] Mocked provider, mixed quiz: submit returns `evaluated` with per-question results and the overall score. The usage record shows `answer_evaluation`, `promptVersion`, and `succeeded`.
- [x] Mocked invalid output (a missing question id, a bad result value, an unknown `sourceRef`) leaves the status at `evaluation_failed` with the responses intact. A retry with valid output then succeeds.
- [x] With AI disabled, no key, or the limit reached, submit returns the typed error, the responses are saved (`evaluation_failed`), and the quiz detail still opens.
- [x] After the source notes are edited or deleted, evaluating a new attempt on the same quiz still works, and earlier evaluated attempts are unchanged.
- [x] No response, log line, or `AiUsage` record contains the key, prompt instructions, the snapshot, or learner response text.
- [x] User B gets 404 on user A's attempt submit and evaluate routes. No token gives 401.
- [x] Swagger on both APIs matches the implemented routes.

## Implementation notes
- `runAiOperation` already records usage on failure. Pass `promptVersion` and context counts from the **quiz** (not a fresh assemble). Evaluation can use the default AI timeout unless it proves too short.
- Mock the provider as in P5-02. Run a real call if a key is available; otherwise record the limitation.
