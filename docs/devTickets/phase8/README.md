# Phase 8 — AI quiz generation experiment

**Status:** Tickets 8000–8006 done. Follow-on 8007–8009 (workspace quiz visibility + content size) ready. Live model calls remain manual for the experiment protocol.

**Objective.** Make the quiz-generation model, context budget, output budget, and reasoning effort easy to change, and provide a controlled manual protocol for comparing reliability, quality, and cost. Follow-on work improves usage visibility for those experiment runs, centralises model pricing metadata, exposes per-request model selection with pre-generate cost approximations, and surfaces subject/topic-scoped quizzes, study history, and content character totals in the Content Workspace.

**Deliverable.** A baseline constants file, one pointer, and one constants file per prepared run, plus the operator guide. The baseline run preserves today's behaviour. Live model calls are run by the developer; they are not part of ticket acceptance. Question-type counts on AI usage, a central model catalogue for pricing, and a quiz-form model picker with live preview estimates are included in this phase. Workspace quiz list / study panel and content size fields are 8007–8009.

**Depends on.** Phases 5–7 as shipped, including AI-run diagnostics 7015–7019.

**Roadmap.** [Phase 8 in the MVP plan](../00_MVP-Development-Plan.md#phase-8).

**Tickets.** Phase 8 starts at `8000`.

1. [8000](8000-ai-quiz-generation-experiment.md) — configurable quiz output and reasoning controls, plus the manual experiment guide. Done.
2. [8001](8001-question-type-counts-ai-usage.md) — persist nullable question-type counts on AI usage (`server-data` + `server-webApp`). Done.
3. [8002](8002-model-catalogue.md) — central model catalogue for pricing and default selection. Done. Independent of 8001/8003.
4. [8003](8003-question-type-counts-ui.md) — show question-type counts on Profile and shared `AiRunDetails`. Done (browser UAT pending). Depends on 8001.
5. [8004](8004-quiz-model-selection-api.md) — `GET /ai/models`, optional `model` on preview/generate, preview cost estimates. Done. Depends on 8002 and 7018.
6. [8005](8005-quiz-model-picker-ui.md) — generate-form model picker (default Luna) + live estimate summary. Done. Depends on 8004 and 7019.
7. [8006](8006-workspace-tree-layout.md) — workspace topic tree cap/scroll, alphanumeric sibling order, Quiz History scaffold. Done.
8. [8007](8007-quiz-subject-filter-api.md) — `GET /quizzes` optional `subjectId` filter. Ready. Depends on 7030.
9. [8008](8008-content-character-totals.md) — `ownContentChars` and `subtreeContentChars` on subject/topic reads. Ready. Depends on 7006. Parallel with 8007.
10. [8009](8009-workspace-study-panel.md) — workspace size summary, scoped quiz list, and study history panel. Ready. Depends on 8006, 8007, 8008, and 7013.

**Not in this phase.** Automatic retries, a question limit above 20, batch generation, prompt or schema changes, and storing raw model output. Those options are recorded at the end of the experiment, not implemented here. Evaluation results-screen AI-run details stay out unless a later ticket asks for them. Per-request context/output/reasoning overrides stay out of 8004–8005. Completeness indicators (7027/7028) stay deferred.

**Planning decisions (change before implementing if wrong).**

- **Constants files for this experiment.** Run files vary context size, output cap, reasoning effort, and quiz timeout (not model). Prices and display names live in `server-webApp/src/constants/aiModels.js`. `baseline.js` fixes default model `gpt-6-luna`, default output 16,000, min context, and monthly token allowance, and merges the run selected by `active.js`. Restart `server-webApp` after changing that pointer. Do not put these values in `.env`. Pick comparison models on the generate form / request body.
- **Quiz generation only.** The new output cap and reasoning effort do not change description suggestion or answer evaluation. Optional `model` in 8004 is quiz preview/generate only.
- **Defaults.** An absent or invalid output cap stays 16,000. An absent or invalid reasoning effort is omitted. Omitted request `model` resolves to the fixed Luna default (not a per-run model).
- **No new public data from 8000.** Reasoning effort is not added to `aiRun`, usage records, or Swagger. The operator records the active run id beside each result.
- **Question-type counts (8001/8003).** Persist nullable MC/SA totals and evaluation `shortAnswerAiCount` on usage `context`. No Mongo backfill. UI treats missing fields as unknown, not zero. Evaluation visibility stays on Profile.
- **Model picker (8004/8005).** Catalogue list and estimate math are server-driven. Preview uses a chars÷4 input-token heuristic (including instructions) and an output-cost ceiling from `maxOutputTokens`. UI defaults the select to Luna (`gpt-6-luna`). Live estimates debounce the existing preview endpoint.
- **The developer spends the model budget.** The guide sets a $15 estimated-cost stop, below the $50 development-key cap. Implementation does not call OpenAI.
- **Workspace quiz visibility (8007–8009).** Characters, not words. Own content = notes + own documents (description excluded). Subtree = own + descendant topics. Always return both char fields; when there is no subtree they are equal. Subject quiz list uses `subjectId` (includes whole-subject quizzes); topic list reuses `topicIds` OR matching. Study panel reuses `GET /study-history` in compact form (no full Dashboard chrome).
