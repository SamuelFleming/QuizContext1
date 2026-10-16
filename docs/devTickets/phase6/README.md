# Phase 6 — Quizzing MVP

**Objective.** Close the active-recall loop: generate a Targeted quiz from the user's material, complete it, receive source-informed feedback, review, repeat, and export.

**Deliverable.** Quiz generation and persistence, a player that hides marking until submit, deterministic multiple-choice marking, AI short-answer feedback, attempt history, and a basic Markdown export.

**Depends on.** Phase 5 `assembleContext` and `runAiOperation`, Phase 4 content, Phase 3 usage limits.

**Roadmap.** [Phase 6 in the MVP plan](../00_MVP-Development-Plan.md#phase-6).

**Tickets.**

1. [P6-01](P6-01-quiz-generation-api.md) — generation API, quiz persistence, study-view projection.
2. [P6-02](P6-02-quiz-generation-ui.md) — generation form and saved-quiz detail.
3. [P6-03](P6-03-attempt-player.md) — attempts and the Quiz Player (no marking).
4. [P6-04](P6-04-attempt-evaluation-api.md) — submit evaluates; MC by comparison, short answer via AI.
5. [P6-05](P6-05-quiz-results.md) — results screen and evaluation-failed retry.
6. [P6-06](P6-06-library-repeat-export.md) — library, history, delete, export, dashboard activity, phase close-out.

**Planning decisions (change before implementing if wrong).**

- **Frozen snapshot, not a live re-resolve.** MVP plan §3 says generation and short-answer evaluation "use the same resolver." Core scope §3.3, product theory §7, the Phase 4 README, and Phase 6 "Done when" require source edits not to change saved quizzes or earlier attempts. **Resolution:** generation calls `assembleContext`. Evaluation uses that quiz's stored `sourceSnapshot` and `sourceManifest`. Do not call `assembleContext` again at marking time. The resolver is one path at generation; the snapshot is what evaluation reads.
- **Data API holds keys; the business study view does not.** `server-data` returns the full quiz (options' correct index, expected answers, criteria, snapshot) to `server-webApp` only. Business `POST /quizzes` and `GET /quizzes/:quizId` return a study-view projection: prompts, options, settings, and manifest titles/status. Answer keys appear to the client only on an evaluated attempt (P6-04) and in the export (P6-06).
- **No content cascade onto quizzes.** Subject/topic/document delete must not delete or rewrite quizzes. Scope names are stored on the quiz for that reason. Deleting a quiz (P6-06) deletes its attempts only.
- **Evaluation lives on the attempt**, not a separate collection. One AI call per attempt covers all non-blank short answers (`answer_evaluation`). Blank short answers are `incorrect` with no AI. Multiple-choice is scored by comparison, with a short deterministic explanation — no AI. The overall `summary` is derived from the scores (no second AI call). Short-answer `partial` maps to score `0.5`.
- **In-progress reuse.** Starting an attempt while one is `in_progress` for that quiz returns it. After submit, a new start creates a new attempt.
- **Defaults:** 6 multiple-choice and 4 short-answer (total 1–20), difficulty `medium` (`easy|medium|hard`), `contextMode` `targeted` (all three `CONTEXT_MODES` selectable), `includeDescendants` true.
- **Title** is the selection name from `assembleContext` (content name limit). Two quizzes from the same topic share a title and are distinguished by date.
- **Export** is Markdown. The existing client always parses JSON (`{ data }`); return `{ filename, markdown }` and let the client save a `.md` file. No snapshot text, no attempts, in the file.
- **Generation timeout.** `runAiOperation` today uses a 20 s default (`AI_TIMEOUT_MS`), which is tight for 20 questions. Add an optional per-call `timeoutMs`. Generation reads `AI_QUIZ_TIMEOUT_MS` (default 60,000). Evaluation keeps the existing default unless it proves too short.
- **Proposed field limits:** prompt 1,000; option 300; expected answer 2,000; marking criterion 500 (1–5); concepts 5 × 80; learner short answer 2,000; evaluation explanation 1,000; missing concepts 5. `sourceRefs` must be manifest ids with status `included` or `truncated`.
- Targeted is the mode that must work. Very Strict and Loose stay representable with one instruction line each; no extra mode-specific selection rules.

**Not blocking.** A real successful OpenAI call is still unrun locally (Phase 3 follow-up). Mock the provider as in P5-02. Run a real call in P6-01 or P6-04 if a key is available; otherwise record the limitation.
