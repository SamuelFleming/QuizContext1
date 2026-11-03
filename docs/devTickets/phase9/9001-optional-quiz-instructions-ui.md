# 9001 — Optional quiz instructions UI

**Status:** Done
**Phase:** 9
**Depends on:** 9000
**Relevant scope:** F05 / S05 quiz generation and saved quiz detail

## Objective
Let a learner enter optional quiz-generation instructions and later see the historical instructions stored with a saved quiz.

## In scope
- A labelled multiline **Quiz instructions (optional)** field with helper text and a 2,000-character count/limit.
- Send trimmed non-empty instructions to debounced preview and final generation; omit empty values.
- Keep the field editable after validation/provider failure and after the existing in-session **Generate another** action.
- Disable the field while generation is active.
- Read-only saved-quiz detail display for non-empty historical instructions; omit the section for legacy/null quizzes.
- Responsive styling through existing design tokens.

## Out of scope
- Editing instructions on an existing quiz, a saved-quiz regeneration endpoint, reusable presets, profile defaults, live/adaptive oral interviews, and unrelated generation-form redesign.

## Acceptance checks
- [x] Empty instructions leave preview/generation request behaviour unchanged.
- [x] Non-empty instructions reach preview and generation, are retained across failure and **Generate another**, and survive saved-quiz reload.
- [x] The field has accessible label/helper/count text and blocks more than 2,000 characters without an API call.
- [x] Saved detail shows historical instructions read-only and continues to omit answer keys, criteria, and source snapshot.
- [x] Server validation errors remain visible through the existing generation error path.
- [ ] Desktop and narrow layouts remain readable and keyboard-friendly.
- [x] Client lint and production build pass; browser limitations are documented.
- [ ] Manual provider UAT compares the same source/settings with no instructions and representative implementation/oral-exam instructions, checking changed emphasis without format/count violations or unsupported claims.

## Implementation notes
- Primary files: `client-webApp/src/features/quizzes/QuizGeneratePage.jsx`, `client-webApp/src/features/quizzes/QuizDetailPage.jsx`, and `client-webApp/src/styles/app.css`.
- The existing form state survives `resetGeneration`; do not add a separate regeneration workflow.

## Outcome notes
- The generation form sends only trimmed non-empty instructions to preview/generate, retains the field in existing form state, and enforces the 2,000-character limit.
- Saved quiz detail shows non-empty historical instructions as read-only pre-wrapped text.
- Client lint passes with existing warnings; production build and changed-file IDE lint pass.
- Browser/narrow-layout and live-provider quality UAT remain pending manual testing.
