# AI quiz generation experiment

## Purpose
Compare quiz-generation reliability and quality on one unchanged corpus. Select the next case by changing the import in `server-webApp/src/constants/aiExperiment/active.js`, then restart `server-webApp`. Do not change the prompt, schema, selected topics, difficulty, or context mode during a comparison.

`active.js` initially contains:

```js
export { run } from "./runs/baseline.js";
```

Change that one path to another file in `runs/`, for example `./runs/luna-16k.js`. A later case copies the nearest run file, changes only its own values, and is selected the same way. Do not edit `baseline.js` or an existing run file to begin a new case.

## Controls and current official references
`server-webApp/src/constants/aiExperiment/baseline.js` holds the fixed values: default model `gpt-6-luna` (when a request omits `model`), default output cap 16,000 tokens, minimum context 200 characters, and application monthly allowance 100,000 tokens. Each file in `runs/` holds budget knobs only (no model). `active.js` chooses the case. **Pick the comparison model on the generate form** (or pass `model` in the API body). Restart after changing `active.js`.

These values are not read from `.env`. Secrets, `AI_ENABLED`, and `OPENAI_API_KEY` stay there. `AI_TIMEOUT_MS` still applies only to non-quiz AI calls.

| Value | Where | Experiment use |
| --- | --- | --- |
| `model` | Generate form / request body (omit → fixed Luna default) | Comparison model |
| `contextMaxChars` | Run file | Input coverage sweep |
| `quizMaxOutputTokens` | Run file (default / working ceiling 16,000) | Output capacity |
| `quizTimeoutMs` | Run file | Longer on large-context runs |
| `reasoningEffort` | Run file | Quality sweep; leave `null` unless comparing effort |

Prepared budget runs include `baseline`, `luna-16k` / `16k-48kch`, `16k-100kch`, and `16k-200kch` (names reflect output×context, not model).

Cost estimates use input/output USD rates from `server-webApp/src/constants/aiModels.js`. Do not put prices or model ids on run files. When adding a catalogue model, add rates and `displayName` there. `GET /ai/models` lists the catalogue; preview returns approximate costs (chars÷4 input tokens; output $ is a `maxOutputTokens` ceiling) plus `contextMaxChars`. Record both the **active run id** and the **selected model** for each trial.

Verify model IDs, limits, and prices again before spending money:

- [Models](https://platform.openai.com/docs/models)
- [`gpt-6-luna`](https://platform.openai.com/docs/models/gpt-6-luna): input $0.10, output $0.50 per 1M tokens; 128,000 maximum output
- [`gpt-6.1-sol`](https://platform.openai.com/docs/models/gpt-6.1-sol): input $2, output $10 per 1M tokens; 128,000 maximum output
- [`gpt-6-astra`](https://platform.openai.com/docs/models/gpt-6-astra): input $10, output $50 per 1M tokens; 128,000 maximum output

If a dated snapshot makes estimated cost blank, keep the token counts and calculate cost from the catalogue or the published rates above. Prompts above 272,000 input tokens have higher published rates; this protocol stays far below that threshold.

Reasoning tokens consume `max_output_tokens` and are billed as output. A high effort can therefore cost more and still finish as `output_truncated`. Start with `reasoningEffort: null`. Compare `high` only after that case is reliable. Do not start with `xhigh` or `max`.

`gpt-6.1-sol` and `gpt-6-astra` do not support `none`. Use `null` on the baseline run rather than sending `none` to `gpt-4o-mini`.

## Fixed case
Choose one representative multi-topic subject that already includes cross-topic material and at least ten short-answer questions' worth of content. Do not edit its notes or documents during the experiment.

Use the same generation choices for every paired comparison:

- explicit complete topic set
- Targeted context mode
- the same difficulty
- either 0 multiple-choice and 10 short-answer, or 0 multiple-choice and 20 short-answer, as the matrix specifies

Before every generation, use preview and record `inputChars`, `maxOutputTokens`, and included, truncated, and excluded topic and document counts. Preview does not spend model budget.

## Stop ceiling
Stop when estimated experiment spend reaches $15, or when the next planned case could pass $15. This is deliberately below the $50 development-key cap. Also stop a case after two identical provider failures and record the error code.

The fixed 100,000 monthly application-token allowance can block this matrix. For an application key, change only `appMonthlyTokenLimit` in `baseline.js` for the session and restore 100000 afterwards. A saved user key is not limited by that setting. Either way, the $15 ceiling remains.

The prepared 32,000 and 64,000 Luna runs already use a 180,000 ms quiz timeout. A copied quality or reasoning run uses at least 180,000 ms as well. A timeout at 60,000 ms is not evidence that the model failed.

## Run matrix
Repeat every case twice. Keep the corpus and quiz choices fixed.

1. **Baseline.** `gpt-4o-mini`, 8,000 output tokens, 48,000 context characters, reasoning unset. Run the 10-question and 20-question sizes.
2. **Capacity.** `gpt-6-luna`, reasoning unset, 48,000 context characters. Try 8,000, then 16,000, then 32,000 output tokens at both question sizes. Try 64,000 only for a size that still returns `output_truncated` at 32,000.
3. **Quality.** At the smallest output cap that succeeded twice for that question size, compare `gpt-6-luna` with `gpt-6.1-sol`. First leave reasoning unset, then compare `high` only for cases that did not truncate. Run `gpt-6-astra` only if Sol's accepted quizzes are still too shallow, and only for the 10-question size.
4. **Input coverage.** After output reliability is stable, compare 48,000 with 96,000 context characters on the selected reliable model and cap. Record which sources move from excluded or truncated to included. More included text is not treated as better quality by itself.

## Record each run
Record the active run `id` and its constants, both question counts, preview counts, HTTP result, error code, failure codes, returned model, input tokens, output tokens, latency, estimated or calculated cost, and timeout.

For a successful quiz, also score it manually from 1 to 5:

- topic coverage
- duplication
- grounding in the supplied material
- exam depth: whether it tests understanding rather than only wording recognition
- answer correctness
- marking-criteria usefulness

Use the saved quiz and its export for that review. Do not copy source text or answer keys into the findings.

## Results
Fill this section after the manual runs.

- Default model worth keeping:
- Output cap worth keeping:
- Context budget worth keeping:
- Reasoning effort worth keeping:
- Timeout worth keeping:
- Are 10 short-answer questions reliable?
- Are 20 short-answer questions reliable?
- Did 64,000 output tokens earn their cost?
- Did 96,000 input characters earn their cost?
- Later ticket needed for one retry?
- Later ticket needed for a 40-question limit?
- Later ticket needed for batch generation?
- Later ticket needed for prompt changes?
- Later ticket needed for dev-only raw-output capture?
