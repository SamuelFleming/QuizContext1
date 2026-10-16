# 8002 — Model catalogue for pricing and default selection

**Status:** Done  
**Phase:** 8  
**Depends on:** 8000  
**Relevant scope:** AI usage estimates; quiz generation model selection (server-webApp)

## Objective
Centralise model metadata (starting with input/output USD per 1M tokens) in one `server-webApp` dictionary keyed by model id, so cost estimates and the default model no longer duplicate rates inside experiment run files or a local `PRICES_PER_1M` map. Scaffold resolution so a caller-supplied model can be accepted later, while MVP callers keep using the active experiment run’s model.

## Placement (boundary decision)
- Own this in **`server-webApp` only**. Pricing estimates, model choice, and OpenAI calls are business-API concerns.
- Do **not** put the catalogue in `server-data`, the browser, or Mongo for this ticket.
- Do **not** expose a public “list models” or “set model” endpoint yet; only an internal lookup used by existing AI flows.

## In scope
- Add `server-webApp/src/constants/aiModels.js`, exporting a dictionary keyed by OpenAI model id (`gpt-4o-mini`, `gpt-4.1-mini`, `gpt-6-luna`, `gpt-6.1-sol`, `gpt-6-astra`, …). Each entry holds:
  - `priceInputPer1M`
  - `priceOutputPer1M`
- Replace `PRICES_PER_1M` in `aiConfig.js` and remove `priceInputPer1M` / `priceOutputPer1M` from `aiExperiment/runs/*.js` and the experiment merge. Run files keep `model` (and other experiment knobs); prices come from `catalogue[model]`.
- `estimateCostUsd(model, usage)` resolves rates via exact match, then **longest-prefix** catalogue key (`model === key` or `model.startsWith(key + '-')`). Unknown model → `null` cost (unchanged behaviour).
- Introduce `resolveModel({ requestedModel } = {})` and wire it into `runAiOperation`:
  - If `requestedModel` is absent/empty → use the active experiment run’s `model` (via experiment config). Do not reintroduce `AI_MODEL_DEFAULT`.
  - If `requestedModel` is present → validate it exists in the catalogue (exact or prefix); reject unknown ids with typed `AI_UNKNOWN_MODEL` (400). When valid, pass the requested string through to OpenAI (so dated snapshots remain usable).
  - For this ticket, **no HTTP route accepts `model` yet**. Call sites pass nothing so behaviour stays identical.
- Keep estimates only: still token counts × catalogue rates; do not call OpenAI billing APIs.
- Update the experiment guide note that prices live in the catalogue, not per run file.
- Document `AI_UNKNOWN_MODEL` on the business OpenAPI `AiError` schema.
- Changing `active.js` between prepared runs still selects model / context / output / timeout / reasoning; only prices move to the catalogue.

## Out of scope
- Per-request model selection in quiz generate / preview / evaluate / description APIs (scaffold only).
- Client UI model picker.
- Syncing prices from OpenAI automatically.
- Storing catalogue rows in `server-data` / Mongo.
- Changing experiment selection via `active.js`, output caps, context budget, or reasoning effort.
- Changing how usage rows are shaped beyond continuing to store `estimatedCostUsd`.

## Acceptance checks
- [x] One catalogue is the sole source of model input/output rates used by `estimateCostUsd`.
- [x] Experiment run files no longer define price fields; selecting `gpt-6-luna` (etc.) still produces non-null estimates when token counts exist.
- [x] Dated snapshot model strings (e.g. `gpt-6-luna-…`) still match the base catalogue key via longest-prefix.
- [x] `resolveModel` exists and defaults when no model is passed; unknown explicit model is rejected in a focused check without requiring a public API change.
- [x] `runAiOperation` accepts optional `model` and resolves through `resolveModel`.
- [x] No browser → `server-data` path; no model catalogue in `server-data`.
- [x] Focused check: estimate for a known catalogue model with 1M in + 1M out equals the catalogue rates; unknown model returns `null`.
- [x] Operator/experiment docs mention the catalogue location.
- [x] Experiment investigation continues: `active.js` pointer still drives model and quiz knobs.

## Implementation notes
- Shape:

```js
export const AI_MODELS = {
  "gpt-4o-mini": { priceInputPer1M: 0.15, priceOutputPer1M: 0.6 },
  "gpt-6-luna": { priceInputPer1M: 0.1, priceOutputPer1M: 0.5 },
  // …
};

export function getModelMeta(modelId) { /* exact or longest-prefix match */ }
export function resolveModel({ requestedModel } = {}) { /* default vs catalogue */ }
```

- Future API wiring (not this ticket): optional `model` on AI request bodies → controller → service → `runAiOperation({ model })` → `resolveModel({ requestedModel: body.model })`. Default remains the experiment model when omitted.
- Verify published OpenAI rates when copying numbers into the catalogue; keep the “estimates only” product wording in Profile / usage UI.

## Outcome notes

How these changes unlock later work:

- **Business API model selection.** A future ticket can add optional `model` on quiz generate / evaluate / description request bodies. Controllers pass it into the service, which already calls `runAiOperation({ model })` → `resolveModel`. Omitted → active experiment (or later a product default). Unknown → typed `AI_UNKNOWN_MODEL` 400 already defined in OpenAPI.
- **Client model picker.** List allowed ids via a thin `GET /ai/models` that returns catalogue metadata (add `displayName` when needed), or a static client allow-list. The generate form sends the selected id; Profile continues to show stored `estimatedCostUsd` from usage rows.
- **Catalogue growth.** Add fields such as `displayName`, `maxOutputTokens`, or `supportsReasoning` when a picker or per-model caps need them. Keep this file the single rate source so estimates stay consistent.
- **Experiment vs product default.** After Phase 8 experiment work ends, change only `resolveModel`’s empty-default path (today: `active.js` run’s `model`) to a named product default in the catalogue — call sites that omit `model` need no further edits.
- **Ongoing AI investigation.** Operators still flip `active.js` and restart `server-webApp`. Run files keep model, context, output, timeout, and reasoning. New comparison models need a run file **and** a catalogue price row.
- **Not implied next.** Mongo-backed catalogue, automatic OpenAI price sync, or rates in `server-data`.
