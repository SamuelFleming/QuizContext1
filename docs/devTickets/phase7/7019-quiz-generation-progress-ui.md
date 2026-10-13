# 7019 — Quiz generation progress and result UI

**Status:** Done (lint and build verified; browser and mocked-provider acceptance pending manual UAT)
**Phase:** 7
**Depends on:** 7016, 7018
**Relevant scope:** F05; S05; `04_flows-to-screens.md` §7.3; `01_design-concept.md`

## Objective
Make quiz generation understandable while it is running and after it returns. Keep successful users on a result step until they choose to open the quiz, and make typed failures and safe run details visible in the same flow.

## In scope
- On submit, call quiz preview first and show a preparing state until its metrics arrive.
- During generation show prompt input characters, included topic/document counts, truncation/exclusion information, and the maximum output-token cap in a dedicated loading component.
- Label exact input/output token counts as completion metrics; do not imply that preview has provider token counts.
- On success, remain on the generation screen, show input/output token totals, and provide a primary **Open quiz** action instead of navigating automatically.
- On failure, preserve the selected form values and show the AI error code, message, validation failures, and returned run metrics when present.
- Add an accessible, dismissible **See details** dialog containing the same safe Validation, Limits, and Scope information as Profile recent activity.
- Extract those diagnostic sections into a shared component used by both the generation flow and Profile.
- Keep the existing Profile link for account/configuration error codes.
- Fit the generation states and dialog at 390px without horizontal overflow.

## Out of scope
- Retry generation, automatic retry, cancellation, or progress percentages.
- Description-suggestion and answer-evaluation flows.
- New failure-code semantics or changes to AI reliability.
- Showing source text, prompt instructions, raw model output, credentials, answer keys, or marking criteria.

## Acceptance checks
- [ ] Submit shows a preparing state, then server preview metrics while the generation request is in flight. *(Pending browser UAT.)*
- [ ] Successful generation shows completion token totals and does not navigate until **Open quiz** is selected. *(Pending mocked-provider browser UAT.)*
- [ ] A failed `AI_INVALID_OUTPUT` shows the error code, message, failure reasons, and **See details** when run data exists. *(Pending mocked-provider browser UAT.)*
- [x] `CONTEXT_INSUFFICIENT` has no `aiRun`, so the existing guidance renders without a false run-details action.
- [x] The native details dialog has a labelled close action, Escape support, explicit focus restoration, and reuses Profile diagnostic content.
- [x] Client projections reference only the allow-listed preview/run fields and contain no answer key, API key, source body, or raw model response.
- [x] Profile recent activity renders the extracted shared details component.
- [ ] At 390px the loading, result, error, and dialog content fit. *(Responsive rules added; pending visual UAT.)*
- [x] Client lint passes with only the pre-existing Diagnostics warning; production build passes.

## Implementation notes
This ticket intentionally supersedes P6-02's immediate navigation after successful generation. The two-request flow assembles context twice; sharing server validation and context preparation prevents rule drift, while the second assembly remains authoritative if source content changes between calls.
