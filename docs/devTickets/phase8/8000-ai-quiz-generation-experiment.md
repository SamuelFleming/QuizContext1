# 8000 — AI quiz generation experiment

**Status:** Approved
**Phase:** 8
**Depends on:** 7015, 7018
**Relevant scope:** Phase 8 README; F05; P5-01; P6-01

## Objective
Make quiz-generation output size and reasoning effort configurable without changing product behaviour by default, and leave a manual protocol for comparing model, budget, reliability, quality, and cost.

## In scope
- Add `AI_QUIZ_MAX_OUTPUT_TOKENS` to `getAiConfig()` in `server-webApp/src/config/aiConfig.js`.
  - Accept an integer from 1,000 through 128,000.
  - Absent, empty, non-integer, or out-of-range values use 8,000, the current hard-coded cap.
  - Log one warning per process when the configured value is invalid.
- Use that configured cap in both quiz preview and quiz generation. Remove the live use of `MAX_OUTPUT_TOKENS` in `server-webApp/src/openai/prompts/quizGeneration.js`.
- Add optional `AI_QUIZ_REASONING_EFFORT` to the same config.
  - Accept only `none`, `low`, `medium`, `high`, `xhigh`, and `max`.
  - Absent, empty, or invalid values omit the field. Log one warning per process for an invalid value.
  - Pass `reasoning: { effort }` to the Responses API only from quiz generation. Description suggestion and answer evaluation do not receive it.
  - Confirm the installed `openai` SDK forwards `reasoning` on `responses.create`. If this version strips it, update that SDK inside this ticket rather than adding a second client.
- Document the experiment controls in `server-webApp/.env.example`, including the controls that already exist but are undocumented there:
  - `AI_MODEL_DEFAULT`
  - `AI_CONTEXT_MAX_CHARS` (default 48,000) and `AI_CONTEXT_MIN_CHARS` (default 200)
  - `AI_QUIZ_MAX_OUTPUT_TOKENS` (default 8,000)
  - `AI_QUIZ_REASONING_EFFORT` (empty by default)
  - `AI_TIMEOUT_MS` and `AI_QUIZ_TIMEOUT_MS`
  - `AI_APP_MONTHLY_TOKEN_LIMIT`
  - `AI_PRICE_INPUT_PER_1M` and `AI_PRICE_OUTPUT_PER_1M`
- State that `.env` is loaded at process start, so `server-webApp` must be restarted after a change. The client and `server-data` do not use these values.
- Create `docs/experiments/ai-quiz-generation.md` with the operator guide below. Do not paraphrase away its run matrix, stop ceiling, or decision record.
- Preserve the current API shapes, ownership checks, strict JSON schema, prompt text and version, 1–20 question limit, diagnostics fields, and no-retry behaviour.

## Out of scope
- Calling OpenAI during implementation or acceptance. The developer runs the protocol manually afterwards.
- Automatic retries, batch generation, prompt or schema changes, and a question limit above 20.
- Changing description-suggestion or answer-evaluation budgets.
- Adding reasoning effort, raw model output, prompts, source text, or answer keys to usage records, `aiRun`, logs, or Swagger.
- Per-request model or budget selection. The model remains the existing global `AI_MODEL_DEFAULT`.
- Changing the built-in `PRICES_PER_1M` table. Cost display continues to use the existing default-model price override.

## Operator guide
Write the following protocol to `docs/experiments/ai-quiz-generation.md`.

### Purpose
Compare quiz-generation reliability and quality on one unchanged corpus. Change one named environment setting between cases. Do not change the prompt, schema, selected topics, difficulty, or context mode during a comparison.

### Controls and current official references
Restart `server-webApp` after every `.env` edit.

| Setting | Default | Experiment use |
| --- | --- | --- |
| `AI_MODEL_DEFAULT` | `gpt-4o-mini` | Baseline and comparison models |
| `AI_CONTEXT_MAX_CHARS` | `48000` | Input coverage sweep |
| `AI_QUIZ_MAX_OUTPUT_TOKENS` | `8000` | Output capacity sweep |
| `AI_QUIZ_REASONING_EFFORT` | empty | Quality sweep; leave empty for the baseline |
| `AI_QUIZ_TIMEOUT_MS` | `60000` | Raise for large output or reasoning |
| `AI_APP_MONTHLY_TOKEN_LIMIT` | `100000` | Raise for an application-key sweep, then restore it |
| `AI_PRICE_INPUT_PER_1M`, `AI_PRICE_OUTPUT_PER_1M` | unset | Set both to the active model's prices |

Verify model IDs, limits, and prices again before spending money:

- [Models](https://platform.openai.com/docs/models)
- [`gpt-6-luna`](https://platform.openai.com/docs/models/gpt-6-luna): input $0.10, output $0.50 per 1M tokens; 128,000 maximum output
- [`gpt-6.1-sol`](https://platform.openai.com/docs/models/gpt-6.1-sol): input $2, output $10 per 1M tokens; 128,000 maximum output
- [`gpt-6-astra`](https://platform.openai.com/docs/models/gpt-6-astra): input $10, output $50 per 1M tokens; 128,000 maximum output

The price override applies only when the returned model exactly matches `AI_MODEL_DEFAULT`. If a dated snapshot makes estimated cost blank, keep the token counts and calculate cost from the prices above. Prompts above 272,000 input tokens have higher published rates; this protocol stays far below that threshold.

Reasoning tokens consume `max_output_tokens` and are billed as output. A high effort can therefore cost more and still finish as `output_truncated`. Start with the model default by leaving the setting empty. Compare `high` only after that case is reliable. Do not start with `xhigh` or `max`.

`gpt-6.1-sol` and `gpt-6-astra` do not support `none`. Leave the baseline effort empty rather than sending `none` to `gpt-4o-mini`.

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

The default 100,000 monthly application-token allowance can block this matrix. For an application key, raise `AI_APP_MONTHLY_TOKEN_LIMIT` only for the session and restore it afterwards. A saved user key is not limited by that setting. Either way, the $15 ceiling remains.

For 32,000 or 64,000 output tokens, or any reasoning effort, set `AI_QUIZ_TIMEOUT_MS` to at least 180000 before judging a timeout as model failure.

### Run matrix
Repeat every case twice. Keep the corpus and quiz choices fixed.

1. **Baseline.** `gpt-4o-mini`, 8,000 output tokens, 48,000 context characters, reasoning unset. Run the 10-question and 20-question sizes.
2. **Capacity.** `gpt-6-luna`, reasoning unset, 48,000 context characters. Try 8,000, then 16,000, then 32,000 output tokens at both question sizes. Try 64,000 only for a size that still returns `output_truncated` at 32,000.
3. **Quality.** At the smallest output cap that succeeded twice for that question size, compare `gpt-6-luna` with `gpt-6.1-sol`. First leave reasoning unset, then compare `high` only for cases that did not truncate. Run `gpt-6-astra` only if Sol's accepted quizzes are still too shallow, and only for the 10-question size.
4. **Input coverage.** After output reliability is stable, compare 48,000 with 96,000 context characters on the selected reliable model and cap. Record which sources move from excluded or truncated to included. More included text is not treated as better quality by itself.

### Record each run
Record the environment values, both question counts, preview counts, HTTP result, error code, failure codes, returned model, input tokens, output tokens, latency, estimated or calculated cost, and timeout setting.

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
- [ ] An absent, blank, or invalid `AI_QUIZ_MAX_OUTPUT_TOKENS` resolves to 8,000. A valid value from 1,000 through 128,000 is returned unchanged by preview and recorded as `maxOutputTokens` on the quiz-generation AI run.
- [ ] An absent or invalid `AI_QUIZ_REASONING_EFFORT` omits `reasoning` from the Responses request. A valid value sends `reasoning: { effort }` only for quiz generation.
- [ ] Description suggestion and answer evaluation keep their existing output caps and send no reasoning effort.
- [ ] `.env.example` names the model, context, output, reasoning, timeout, monthly allowance, and price controls, and says that a restart is required. The operator guide names the current model IDs, price links, run matrix, and $15 stop ceiling.
- [ ] No API shape, prompt version, question limit, ownership rule, or retry behaviour changes. Invalid configuration does not expose source text, prompts, or raw output.
- [ ] Changed server files pass `node --check`. The business app starts, and a no-provider preview shows the configured output cap. Live model calls remain manual and are not required for acceptance.

## Implementation notes
`getAiConfig()` already reads `AI_MODEL_DEFAULT`, timeouts, and the monthly allowance on each call. `getContextConfig()` already reads the context character limits. Quiz preview and generation currently pass `prompt.MAX_OUTPUT_TOKENS` from `quizService.js`; both call sites must use the new config so they cannot drift.

Thread an optional reasoning effort through `generateQuiz` → `runAiOperation` → `createStructuredResponse`. Add it to the request object only when present. Do not give it a default of `medium`: the provider's own default must remain in effect when the environment value is empty.

`AI_PRICE_INPUT_PER_1M` and `AI_PRICE_OUTPUT_PER_1M` already override pricing for the configured default model in `estimateCostUsd`. The guide tells the operator to set them when changing models; this ticket does not add model prices to code.

The 20-question ceiling is `QUIZ_QUESTIONS_MAX` in `server-webApp/src/constants/validation.js`, also enforced by the generation form. Leave it unchanged. Forty-question support is a later product decision, not an environment setting.
