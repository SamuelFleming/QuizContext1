# Phase 9 — Optional quiz instructions

**Status:** Build complete; browser and live-provider UAT pending

**Objective.** Let a learner optionally describe what a generated quiz should prioritise or avoid, while keeping source material, enforced quiz settings, and learner preferences distinct.

**Deliverable.** The quiz API validates, applies, and stores optional instructions; the generation form accepts them; and saved quiz detail shows the historical value. Empty instructions retain the existing `quiz-generation@1` prompt path.

**Depends on.** Phase 8 as shipped, including quiz preview, model selection, and the saved-quiz study view.

**Tickets.**
1. [9000](9000-optional-quiz-instructions-api.md) — API validation, versioned prompt integration, persistence, projection, and OpenAPI. Done.
2. [9001](9001-optional-quiz-instructions-ui.md) — generation textarea, request wiring, retained form state, and saved-quiz visibility. Done. Depends on 9000.

**Planning decisions.**
- The API/storage field is `quizInstructions`; the UI label is **Quiz instructions (optional)**.
- Instructions are trimmed, nullable, and limited to 2,000 characters.
- Empty instructions use the unchanged `quiz-generation@1` instructions and input. Non-empty instructions use `quiz-generation@2` and a distinct `LEARNER_PREFERENCES` input section.
- Learner preferences yield to source grounding, selected format/count/difficulty/context mode, factual accuracy, validation, and safety.
- The value is stored separately from the frozen source snapshot. It is not copied into AI usage diagnostics, manifests, logs, or quiz-list summaries.
- There is no saved-quiz regeneration operation. Saved detail is read-only; the existing in-session **Generate another** action retains editable form state.

**Out of phase.** Adaptive or live oral interviews, reusable presets, profile-level preferences, editing historical generation metadata, a saved-quiz regeneration endpoint, automatic instruction rewriting/moderation, retries, batching, and question-limit changes.
