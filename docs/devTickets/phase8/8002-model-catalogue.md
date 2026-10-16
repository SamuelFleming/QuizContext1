# 8002 — Model catalogue for pricing and default selection

**Status:** Planned  
**Phase:** 8  
**Depends on:** 8000  
**Relevant scope:** AI usage estimates; quiz generation model selection (server-webApp)

## Objective
Centralise model metadata (starting with input/output USD per 1M tokens) in one `server-webApp` dictionary keyed by model id, so cost estimates and the default model no longer duplicate rates inside experiment run files or a local `PRICES_PER_1M` map. Scaffold resolution so a caller-supplied model can be accepted later, while MVP callers keep using a hard-coded / config default.

## Placement (boundary decision)
- Own this in **`server-webApp` only**. Pricing estimates, model choice, and OpenAI calls are business-API concerns.
- Do **not** put the catalogue in `server-data`, the browser, or Mongo for this ticket.
- Do **not** expose a public “list models” or “set model” endpoint yet; only an internal lookup used by existing AI flows.

## In scope
- Add a constants module, for example `server-webApp/src/constants/aiModels.js`, exporting a dictionary keyed by OpenAI model id (`gpt-4o-mini`, `gpt-6-luna`, `gpt-6.1-sol`, `gpt-6-astra`, …). Each entry holds at least:
  - `priceInputPer1M`
  - `priceOutputPer1M`
  - optional notes later (display name, max output, reasoning support) — only add fields that are used or clearly stubbed.
- Replace `PRICES_PER_1M` in `aiConfig.js` and remove `priceInputPer1M` / `priceOutputPer1M` from `aiExperiment/runs/*.js`. Run files keep `model` (and other experiment knobs); prices come from `catalogue[model]`.
- `estimateCostUsd(model, usage)` resolves rates by looking up the base model key (exact match or dated snapshot prefix, same matching rule as today). Unknown model → `null` cost (unchanged behaviour).
- Introduce a small resolver used by AI entry points, for example `resolveModel({ requestedModel } = {})`:
  - If `requestedModel` is absent/empty → use the current default (experiment active run’s `model`, or a named default constant if experiment wiring is left as-is).
  - If `requestedModel` is present → validate it exists in the catalogue; reject unknown ids with a typed 400 at the service boundary when wired.
  - For this ticket, **no HTTP route accepts `model` yet**. Call sites pass nothing (or pass the hard-coded default explicitly) so behaviour stays identical. The function signature and one internal call path must make a future request-body `model` trivial to wire.
- Keep estimates only: still token counts × catalogue rates; do not call OpenAI billing APIs.
- Update the experiment guide note that prices live in the catalogue, not per run file.
- Update OpenAPI only if any public response/schema wording about estimated cost needs clarification; no new client-facing model field required.

## Out of scope
- Per-request model selection in quiz generate / preview / evaluate / description APIs (scaffold only).
- Client UI model picker.
- Syncing prices from OpenAI automatically.
- Storing catalogue rows in `server-data` / Mongo.
- Changing experiment selection via `active.js`, output caps, context budget, or reasoning effort.
- Changing how usage rows are shaped beyond continuing to store `estimatedCostUsd`.

## Acceptance checks
- [ ] One catalogue is the sole source of model input/output rates used by `estimateCostUsd`.
- [ ] Experiment run files no longer define price fields; selecting `gpt-6-luna` (etc.) still produces non-null estimates when token counts exist.
- [ ] Dated snapshot model strings (e.g. `gpt-6-luna-…`) still match the base catalogue key.
- [ ] `resolveModel` (or equivalent) exists and defaults when no model is passed; unknown explicit model is rejected in unit/service-level check without requiring a public API change.
- [ ] No browser → `server-data` path; no model catalogue in `server-data`.
- [ ] Focused check: estimate for a known catalogue model with 1M in + 1M out equals the catalogue rates; unknown model returns `null`.
- [ ] Operator/experiment docs mention the catalogue location.

## Implementation notes
- Suggested shape:

```js
export const AI_MODELS = {
  "gpt-4o-mini": { priceInputPer1M: 0.15, priceOutputPer1M: 0.6 },
  "gpt-6-luna": { priceInputPer1M: 0.1, priceOutputPer1M: 0.5 },
  // …
};

export function getModelMeta(modelId) { /* exact or prefix match */ }
export function resolveModel({ requestedModel } = {}) { /* default vs catalogue */ }
```

- Future API wiring (not this ticket): optional `model` on AI request bodies → controller → service → `resolveModel({ requestedModel: body.model })` → `runAiOperation({ model })`. Default remains catalogue/experiment default when omitted.
- Verify published OpenAI rates when copying numbers into the catalogue; keep the “estimates only” product wording in Profile / usage UI.