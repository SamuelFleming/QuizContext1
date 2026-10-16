# Phase 8 — AI quiz generation experiment

**Status:** Tickets 8000–8003 done. Live model calls remain manual.

**Objective.** Make the quiz-generation model, context budget, output budget, and reasoning effort easy to change, and provide a controlled manual protocol for comparing reliability, quality, and cost. Follow-on work improves usage visibility for those experiment runs and centralises model pricing metadata.

**Deliverable.** A baseline constants file, one pointer, and one constants file per prepared run, plus the operator guide. The baseline run preserves today's behaviour. Live model calls are run by the developer; they are not part of ticket acceptance. Question-type counts on AI usage and a central model catalogue for pricing are included in this phase.

**Depends on.** Phases 5–7 as shipped, including AI-run diagnostics 7015–7019.

**Roadmap.** [Phase 8 in the MVP plan](../00_MVP-Development-Plan.md#phase-8).

**Tickets.** Phase 8 starts at `8000`.

1. [8000](8000-ai-quiz-generation-experiment.md) — configurable quiz output and reasoning controls, plus the manual experiment guide. Done.
2. [8001](8001-question-type-counts-ai-usage.md) — persist nullable question-type counts on AI usage (`server-data` + `server-webApp`). Done.
3. [8002](8002-model-catalogue.md) — central model catalogue for pricing and default selection. Done. Independent of 8001/8003.
4. [8003](8003-question-type-counts-ui.md) — show question-type counts on Profile and shared `AiRunDetails`. Done (browser UAT pending). Depends on 8001.

**Not in this phase.** Automatic retries, a question limit above 20, batch generation, prompt or schema changes, and storing raw model output. Those options are recorded at the end of the experiment, not implemented here. Evaluation results-screen AI-run details stay out unless a later ticket asks for them.

**Planning decisions (change before implementing if wrong).**

- **Constants files for this experiment.** Varying model, context size, output cap, reasoning effort, and quiz timeout live in `server-webApp/src/constants/aiExperiment/runs/`. Prices live in `server-webApp/src/constants/aiModels.js`. `baseline.js` holds the fixed values and reads the run selected by `active.js`. Restart `server-webApp` after changing that pointer. Do not put these values in `.env`. No per-request model or budget controls yet; `resolveModel` scaffolds a future request-body `model`.
- **Quiz generation only.** The new output cap and reasoning effort do not change description suggestion or answer evaluation.
- **Defaults preserve today.** An absent or invalid output cap stays 8,000. An absent or invalid reasoning effort is omitted, so the current model path stays compatible.
- **No new public data from 8000.** Reasoning effort is not added to `aiRun`, usage records, or Swagger. The operator records the active run id beside each result.
- **Question-type counts (8001/8003).** Persist nullable MC/SA totals and evaluation `shortAnswerAiCount` on usage `context`. No Mongo backfill. UI treats missing fields as unknown, not zero. Evaluation visibility stays on Profile.
- **The developer spends the model budget.** The guide sets a $15 estimated-cost stop, below the $50 development-key cap. Implementation does not call OpenAI.
