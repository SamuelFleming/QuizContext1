# Phase 8 — AI quiz generation experiment

**Status:** Tickets 8000–8005 done. Live model calls remain manual for the experiment protocol.

**Objective.** Make the quiz-generation model, context budget, output budget, and reasoning effort easy to change, and provide a controlled manual protocol for comparing reliability, quality, and cost. Follow-on work improves usage visibility for those experiment runs, centralises model pricing metadata, and exposes per-request model selection with pre-generate cost approximations.

**Deliverable.** A baseline constants file, one pointer, and one constants file per prepared run, plus the operator guide. The baseline run preserves today's behaviour. Live model calls are run by the developer; they are not part of ticket acceptance. Question-type counts on AI usage, a central model catalogue for pricing, and a quiz-form model picker with live preview estimates are included in this phase.

**Depends on.** Phases 5–7 as shipped, including AI-run diagnostics 7015–7019.

**Roadmap.** [Phase 8 in the MVP plan](../00_MVP-Development-Plan.md#phase-8).

**Tickets.** Phase 8 starts at `8000`.

1. [8000](8000-ai-quiz-generation-experiment.md) — configurable quiz output and reasoning controls, plus the manual experiment guide. Done.
2. [8001](8001-question-type-counts-ai-usage.md) — persist nullable question-type counts on AI usage (`server-data` + `server-webApp`). Done.
3. [8002](8002-model-catalogue.md) — central model catalogue for pricing and default selection. Done. Independent of 8001/8003.
4. [8003](8003-question-type-counts-ui.md) — show question-type counts on Profile and shared `AiRunDetails`. Done (browser UAT pending). Depends on 8001.
5. [8004](8004-quiz-model-selection-api.md) — `GET /ai/models`, optional `model` on preview/generate, preview cost estimates. Done. Depends on 8002 and 7018.
6. [8005](8005-quiz-model-picker-ui.md) — generate-form model picker (default Luna) + live estimate summary. Done. Depends on 8004 and 7019.

**Not in this phase.** Automatic retries, a question limit above 20, batch generation, prompt or schema changes, and storing raw model output. Those options are recorded at the end of the experiment, not implemented here. Evaluation results-screen AI-run details stay out unless a later ticket asks for them. Per-request context/output/reasoning overrides stay out of 8004–8005.

**Planning decisions (change before implementing if wrong).**

- **Constants files for this experiment.** Varying model, context size, output cap, reasoning effort, and quiz timeout live in `server-webApp/src/constants/aiExperiment/runs/`. Prices live in `server-webApp/src/constants/aiModels.js`. `baseline.js` holds the fixed values and reads the run selected by `active.js`. Restart `server-webApp` after changing that pointer. Do not put these values in `.env`. Tickets 8004–8005 add optional per-request `model` on quiz preview/generate only; other experiment knobs stay run-file driven.
- **Quiz generation only.** The new output cap and reasoning effort do not change description suggestion or answer evaluation. Optional `model` in 8004 is quiz preview/generate only.
- **Defaults preserve today.** An absent or invalid output cap stays 8,000. An absent or invalid reasoning effort is omitted, so the current model path stays compatible. Omitted request `model` still uses the active experiment run via `resolveModel`.
- **No new public data from 8000.** Reasoning effort is not added to `aiRun`, usage records, or Swagger. The operator records the active run id beside each result.
- **Question-type counts (8001/8003).** Persist nullable MC/SA totals and evaluation `shortAnswerAiCount` on usage `context`. No Mongo backfill. UI treats missing fields as unknown, not zero. Evaluation visibility stays on Profile.
- **Model picker (8004/8005).** Catalogue list and estimate math are server-driven. Preview uses a chars÷4 input-token heuristic (including instructions) and an output-cost ceiling from `maxOutputTokens`. UI defaults the select to Luna (`gpt-6-luna`). Live estimates debounce the existing preview endpoint.
- **The developer spends the model budget.** The guide sets a $15 estimated-cost stop, below the $50 development-key cap. Implementation does not call OpenAI.
