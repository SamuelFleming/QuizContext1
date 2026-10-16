# 8000 — AI quiz generation experiment

**Status:** Done
**Phase:** 8
**Depends on:** 7015, 7018
**Relevant scope:** Phase 8 README; F05; P5-01; P6-01

## Objective
Make quiz-generation model, context size, output size, and reasoning effort selectable from constants files, without changing product behaviour while the baseline run is selected, and leave a manual protocol for comparing reliability, quality, and cost.

## In scope
- For this experiment, read the varying AI settings from constants files. Do not read them from `.env` and do not add them to `.env.example`.
- Keep secrets and process settings in `.env`: `OPENAI_API_KEY`, `AI_ENABLED`, ports, client origin, data API address, internal API key, JWT secret, and the AI key encryption key.
- Add these modules under `server-webApp/src/constants/aiExperiment/`:
  - `baseline.js` holds the values that stay fixed across the comparison: `contextMinChars` 200 and `appMonthlyTokenLimit` 100000. It imports the selected run and exports one merged config. A run file cannot replace either baseline value.
  - `active.js` is the only pointer. It re-exports exactly one run module. Its initial target is `./runs/baseline.js`.
  - `runs/` contains one constants module per prepared case. Each exports `id`, `model`, `contextMaxChars`, `quizMaxOutputTokens`, `quizTimeoutMs`, `reasoningEffort`, `priceInputPer1M`, and `priceOutputPer1M`.
- Prepare these run files now, and point `active.js` at `runs/baseline.js`:
  - `baseline`: `gpt-4o-mini`, 48,000 context characters, 8,000 output tokens, 60,000 ms timeout, `reasoningEffort: null`, input price 0.15, output price 0.6 per 1M tokens.
  - `luna-8k` and `luna-16k`: `gpt-6-luna`, 48,000 context characters, the named output cap, 60,000 ms timeout, `reasoningEffort: null`, input price 0.1, output price 0.5 per 1M tokens.
  - `luna-32k` and `luna-64k`: the same Luna values, with output caps 32,000 and 64,000 and `quizTimeoutMs` 180000.
- A later case copies the nearest run file, changes only its own values, and is selected by changing the one import in `active.js`. Do not edit `baseline.js` or an existing run file to begin a new case.
- Validate the merged config when it is read.
  - `quizMaxOutputTokens` must be an integer from 1,000 through 128,000. An invalid value uses 8,000 and logs one warning per process.
  - `reasoningEffort` accepts only `null`, `none`, `low`, `medium`, `high`, `xhigh`, and `max`. An invalid value becomes `null` and logs one warning per process.
  - `null` omits `reasoning` from the Responses request. Do not substitute `medium`.
- Use the merged model, output cap, and prices in quiz preview and quiz generation. Remove the live use of `MAX_OUTPUT_TOKENS` in `server-webApp/src/openai/prompts/quizGeneration.js`.
- Use the merged context character limits in context assembly.
- Pass `reasoning: { effort }` only from quiz generation. Description suggestion and answer evaluation do not receive it, and they keep their own output caps.
- The selected run's `model` replaces `AI_MODEL_DEFAULT` for every AI call while that run is active, because the application has one model. Output cap and reasoning effort remain quiz-only.
- Use the selected run's prices for `estimateCostUsd`. Do not change the built-in `PRICES_PER_1M` table and do not read `AI_PRICE_INPUT_PER_1M` or `AI_PRICE_OUTPUT_PER_1M` during this experiment.
- Confirm the installed `openai` SDK forwards `reasoning` on `responses.create`. If this version strips it, update that SDK inside this ticket rather than adding a second client.
- Restart `server-webApp` after changing `active.js` or a run file. Node keeps the imported module until the process restarts. The client and `server-data` do not use these files.
- Create `docs/experiments/ai-quiz-generation.md` with the operator guide below. Do not paraphrase away its run matrix, stop ceiling, or decision record.
- Preserve the current API shapes, ownership checks, strict JSON schema, prompt text and version, 1–20 question limit, diagnostics fields, and no-retry behaviour.

## Out of scope
- Calling OpenAI during implementation or acceptance. The developer runs the protocol manually afterwards.
- Automatic retries, batch generation, prompt or schema changes, and a question limit above 20.
- Changing description-suggestion or answer-evaluation budgets.
- Adding reasoning effort, raw model output, prompts, source text, or answer keys to usage records, `aiRun`, logs, or Swagger.
- Per-request model or budget selection. One selected run applies until `active.js` is changed and `server-webApp` is restarted.
- Reading the experiment settings from `.env`, or adding those settings to `.env.example`.
- Changing the built-in `PRICES_PER_1M` table. The selected run file supplies the prices used for its cost estimate.

## Operator guide
Write the following protocol to `docs/experiments/ai-quiz-generation.md`.

### Purpose
Compare quiz-generation reliability and quality on one unchanged corpus. Select the next case by changing the import in `server-webApp/src/constants/aiExperiment/active.js`, then restart `server-webApp`. Do not change the prompt, schema, selected topics, difficulty, or context mode during a comparison.

### Controls and current official references
`baseline.js` holds the fixed values: minimum context 200 characters and application monthly allowance 100,000 tokens. Each file in `runs/` holds one case, including that case's quiz timeout. `active.js` chooses the case.

| Run value | Baseline run | Experiment use |
| --- | --- | --- |
| `model` | `gpt-4o-mini` | Comparison model |
| `contextMaxChars` | `48000` | Input coverage sweep |
| `quizMaxOutputTokens` | `8000` | Output capacity sweep |
| `quizTimeoutMs` | `60000` | `180000` on the 32k and 64k Luna runs |
| `reasoningEffort` | `null` | Quality sweep; leave `null` for the baseline |
| `priceInputPer1M`, `priceOutputPer1M` | `0.15`, `0.6` | Cost estimate for that model |

Verify model IDs, limits, and prices again before spending money:

- [Models](https://platform.openai.com/docs/models)
- [`gpt-6-luna`](https://platform.openai.com/docs/models/gpt-6-luna): input $0.10, output $0.50 per 1M tokens; 128,000 maximum output
- [`gpt-6.1-sol`](https://platform.openai.com/docs/models/gpt-6.1-sol): input $2, output $10 per 1M tokens; 128,000 maximum output
- [`gpt-6-astra`](https://platform.openai.com/docs/models/gpt-6-astra): input $10, output $50 per 1M tokens; 128,000 maximum output

The selected run supplies the prices for its cost estimate. If a dated snapshot makes estimated cost blank, keep the token counts and calculate cost from the prices above. Prompts above 272,000 input tokens have higher published rates; this protocol stays far below that threshold.

Reasoning tokens consume `max_output_tokens` and are billed as output. A high effort can therefore cost more and still finish as `output_truncated`. Start with `reasoningEffort: null`. Compare `high` only after that case is reliable. Do not start with `xhigh` or `max`.

`gpt-6.1-sol` and `gpt-6-astra` do not support `none`. Use `null` on the baseline run rather than sending `none` to `gpt-4o-mini`.

### Fixed case
Choose one representative multi-topic subject that already includes cross-topic material and at least ten short-answer questions' worth of content. Do not edit its notes or documents during the experiment.

Use the same generation choices for every paired comparison:

- explicit complete topic set
- Targeted context mode
- the same difficulty
- either 0 multiple-choice and 10 short-answer, or 0 multiple-choice and 20 short-answer, as the matrix specifies

Before every generation, use preview and record `inputChars`, `maxOutputTokens`, and included, truncated, and excluded topic and document counts. Preview does not spend model budget.

### Stop ceiling
Stop when estimated experiment spend reaches $15, or when the next planned case could pass $15. This is deliberately below the $50 development-key cap. Also stop a case after two identical provider failures and record the error code.

The fixed 100,000 monthly application-token allowance can block this matrix. For an application key, change only `appMonthlyTokenLimit` in `baseline.js` for the session and restore 100000 afterwards. A saved user key is not limited by that setting. Either way, the $15 ceiling remains.

The prepared 32,000 and 64,000 Luna runs already use a 180,000 ms quiz timeout. A copied quality or reasoning run uses at least 180,000 ms as well. A timeout at 60,000 ms is not evidence that the model failed.

### Run matrix
Repeat every case twice. Keep the corpus and quiz choices fixed.

1. **Baseline.** `gpt-4o-mini`, 8,000 output tokens, 48,000 context characters, reasoning unset. Run the 10-question and 20-question sizes.
2. **Capacity.** `gpt-6-luna`, reasoning unset, 48,000 context characters. Try 8,000, then 16,000, then 32,000 output tokens at both question sizes. Try 64,000 only for a size that still returns `output_truncated` at 32,000.
3. **Quality.** At the smallest output cap that succeeded twice for that question size, compare `gpt-6-luna` with `gpt-6.1-sol`. First leave reasoning unset, then compare `high` only for cases that did not truncate. Run `gpt-6-astra` only if Sol's accepted quizzes are still too shallow, and only for the 10-question size.
4. **Input coverage.** After output reliability is stable, compare 48,000 with 96,000 context characters on the selected reliable model and cap. Record which sources move from excluded or truncated to included. More included text is not treated as better quality by itself.

### Record each run
Record the active run `id` and its constants, both question counts, preview counts, HTTP result, error code, failure codes, returned model, input tokens, output tokens, latency, estimated or calculated cost, and timeout.

For a successful quiz, also score it manually from 1 to 5:

- topic coverage
- duplication
- grounding in the supplied material
- exam depth: whether it tests understanding rather than only wording recognition
- answer correctness
- marking-criteria usefulness

Use the saved quiz and its export for that review. Do not copy source text or answer keys into the findings.

### Decision record
End the guide's results section with:

- the default model, output cap, context budget, reasoning effort, and timeout worth keeping
- whether 10 and 20 short-answer questions are reliable
- whether 64,000 output tokens or 96,000 input characters earned their cost
- which of these need a later ticket, if any: one retry, a 40-question limit, batch generation, prompt changes, or dev-only raw-output capture

## Acceptance checks
- [x] With `active.js` pointing at `runs/baseline.js`, preview reports an 8,000 output cap and context assembly keeps the 48,000-character maximum. The same cap is recorded as `maxOutputTokens` on a quiz-generation AI run.
- [x] An invalid `quizMaxOutputTokens` resolves to 8,000. An invalid `reasoningEffort` becomes `null`.
- [x] `reasoningEffort: null` omits `reasoning` from the Responses request. A valid effort sends `reasoning: { effort }` only for quiz generation.
- [x] Description suggestion and answer evaluation keep their existing output caps and send no reasoning effort.
- [x] Changing the import in `active.js` is the only switch between prepared runs. `.env.example` gains none of the experiment settings. The operator guide names the constants layout, current model IDs, price links, run matrix, and $15 stop ceiling.
- [x] No API shape, prompt version, question limit, ownership rule, or retry behaviour changes. Invalid configuration does not expose source text, prompts, or raw output.
- [x] Changed server files pass `node --check`. The business app starts, and a no-provider preview shows the selected run's output cap. Live model calls remain manual and are not required for acceptance.

## Implementation notes
`baseline.js` imports `active.js`, and `active.js` imports one file in `runs/`. That is the whole selection mechanism. `getAiConfig()` and `getContextConfig()` read the merged result for the experiment values. They do not read `AI_MODEL_DEFAULT`, `AI_CONTEXT_MAX_CHARS`, `AI_CONTEXT_MIN_CHARS`, `AI_QUIZ_TIMEOUT_MS`, `AI_APP_MONTHLY_TOKEN_LIMIT`, or the price override variables while this wiring is present. `AI_TIMEOUT_MS` still applies to non-quiz AI calls.

Quiz preview and generation currently pass `prompt.MAX_OUTPUT_TOKENS` from `quizService.js`. Both call sites must use the merged output cap so they cannot drift.

Thread the merged reasoning effort through `generateQuiz` → `runAiOperation` → `createStructuredResponse`. Add it to the request object only when it is a non-null string. Do not give it a default of `medium`.

Pass the selected run's prices into `estimateCostUsd` for the selected model. Leave `PRICES_PER_1M` unchanged.

Verification exercised preview and context assembly without a provider. Generation passes that same cap into `runAiOperation` as `maxOutputTokens`; no usage row was written because no model call was made. The installed `openai` SDK 7.31.0 already types `reasoning.effort` on `responses.create`, so the SDK was not upgraded.

The 20-question ceiling is `QUIZ_QUESTIONS_MAX` in `server-webApp/src/constants/validation.js`, also enforced by the generation form. Leave it unchanged. Forty-question support is a later product decision, not a run-file value.
