# Phase 5 — Initial AI integration

**Objective.** Produce an AI suggestion informed by the user's own learning content, and save it only after review.

**Deliverable.** A bounded, source-labelled context package and an AI-assisted subject or topic description the user can edit and explicitly save.

**Depends on.** Phase 3 OpenAI key resolution and usage logging, and Phase 4 content with ownership.

**Roadmap.** [Phase 5 in the MVP plan](../00_MVP-Development-Plan.md#phase-5).

**Tickets.** All done (see `devCompletion.md`). Phase 6 reuses `services/contextService.js` (`assembleContext`) and the `promptVersion`/`context` fields on `runAiOperation`.

1. [P5-01](P5-01-context-package.md) — ownership-scoped context resolver: data API source read, ordering, labelling, character budget, truncation and insufficient-content reporting, context-mode input.
2. [P5-02](P5-02-description-suggestion-api.md) — `POST /ai/description-suggestions` through `runAiOperation`, versioned prompt and validator, `AiUsage` extended with prompt version and context counts.
3. [P5-03](P5-03-description-suggestion-ui.md) — workspace Suggest / review / accept / discard, context warnings, error states, phase close-out.

**Planning decisions (change before implementing if wrong).**
- The run log is the existing `AiUsage` record, extended with `promptVersion` and context counts. There is no separate run collection. It never stores prompt or source text.
- The context budget is counted in characters (`AI_CONTEXT_MAX_CHARS`, proposed 48,000), not tokens. Insufficient content means less than `AI_CONTEXT_MIN_CHARS` (proposed 200) of non-whitespace text.
- Tree traversal for the source read stays in `server-data`, reusing `collectSubtreeIds`. Ordering, labelling, and budgeting live in `server-webApp`.
- Description suggestions always use `targeted`. The mode values are `very_strict`, `targeted`, and `loose`, following core scope's "Very Strict". `CLAUDE.md` says "Strict".
- Nothing is persisted on suggestion. Accepting reuses the existing subject or topic `PATCH`.
