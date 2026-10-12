# 7016 — AI run visibility

**Status:** Planned  
**Phase:** 7  
**Depends on:** 7015  
**Relevant scope:** Phase 7 README; S08; P3-04

## Objective
On Profile, each recent AI call shows the scope, the size of the input, the token counts, and the specific failure codes from 7015. A failed quiz generation shows those same codes on the form.

## In scope
- Extend the existing Profile usage list (`UsagePanel`). No new page.
- Each recent row shows operation, success or failure, model, input tokens, output tokens, `inputChars` when present, and the time.
- Expanding a row shows `failures` as the stored codes, `maxOutputTokens`, and the scope: selection name, and each manifest entry's title, path, character count, and status (included, truncated, or excluded). Empty failures on success say that the call passed validation.
- `output_truncated` is labelled "The reply was cut off before it finished." The other codes are shown as their stored names, not rewritten into a new error scheme.
- The quiz generation form, when the error is `AI_INVALID_OUTPUT` and `failures` is present, adds those codes under the existing message. It does not offer a retry button.
- 390px: the expanded row wraps and does not overflow horizontally.

## Out of scope
- Showing source text, prompt instructions, the raw model JSON, or answer keys.
- A chart of failures, a filter, or an export of the log.
- Raising the output cap or retrying generation.

## Acceptance checks
- [ ] From the browser, a failed quiz generation with a mocked `question_count` failure shows that code on the form and, after opening Profile, on the matching usage row together with the selection name and token counts.
- [ ] A truncated failure shows the cut-off label, not only `AI_INVALID_OUTPUT`.
- [ ] A successful generation row shows the metrics and an empty failure list. The expanded scope lists source titles and does not show source text.
- [ ] The usage list and the generation error contain no answer key and no API key.
- [ ] At 390px the Profile list and an expanded row fit. Lint and build pass.

## Implementation notes
Profile already loads `GET /settings/ai/usage`. This ticket displays the fields 7015 adds. The generation form reads `failures` from the error JSON in `generationErrorText`.
