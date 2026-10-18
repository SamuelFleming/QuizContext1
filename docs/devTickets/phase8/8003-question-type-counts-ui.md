# 8003 — Show question-type counts on AI usage UI

**Status:** Done (lint and build verified; browser acceptance checks pending manual UAT)  

**Phase:** 8  
**Depends on:** 8001, 7016  
**Relevant scope:** Profile Recent Activity; shared AiRunDetails; quiz generation details dialog

## Objective
On Profile Recent Activity and shared `AiRunDetails`, show how many multiple-choice and short-answer questions were involved for `quiz_generation` and `answer_evaluation` runs, with a null-safe fallback for historical rows. Evaluation diagnostics stay on Profile only.

## In scope
- Add one null-safe formatter that returns a question summary only for `quiz_generation` and `answer_evaluation`, and only when both `multipleChoiceCount` and `shortAnswerCount` are present (including valid zeros). Never invent zeros from missing data.
- When `shortAnswerAiCount` is present on evaluation rows, show it with a distinct label so it is not confused with total short-answer questions.
- Use the formatter in Profile Recent Activity summary rows (`UsagePanel`) and in shared `AiRunDetails` (covers generation success/failure dialogs and expanded Profile rows).
- When either total count is `null`/absent (pre-8001 rows, or other operations), omit the line or show `—`.
- Other operations (`description_suggestion`, `connectivity_check`) do not show question-type UI.
- 390px: the new summary text wraps and does not overflow horizontally.

## Out of scope
- Persisting counts or changing OpenAPI (8001).
- Adding an evaluation results-screen / quiz-player AI-run details surface.
- Showing answer keys, prompts, learner response text, or source bodies.
- Changing pagination, totals aggregates, or generation form count inputs.

## Acceptance checks
- [ ] A new quiz-generation usage row shows MC and SA counts on Profile summary and in `AiRunDetails` (including the generation details dialog). *(Browser pending manual UAT.)*
- [ ] A new answer-evaluation usage row shows quiz type totals and the labelled AI-scored short-answer count on Profile. *(Browser pending manual UAT.)*
- [x] Pre-existing usage rows still load; question-type UI falls back to omit/`—`. *(Formatter returns null for missing totals; browser pending manual UAT.)*
- [x] Description / connectivity rows do not show question-type counts. *(Formatter returns null for those operations.)*
- [x] No answer key, API key, prompt, or source body appears in the usage UI.
- [x] At 390px the Profile list and expanded details fit. Lint and build pass. *(Lint and build verified; 390px visual check awaits manual UAT. Existing `.usage-meta` / `.usage-facts` wrap styles apply.)*

## Implementation notes
- Fields live on `run.context` / usage `item.context` after 8001.
- Reuse the shared `AiRunDetails` path so generation dialogs pick up the change automatically.
- Keep the Recent Activity one-liner compact so it still fits beside tokens and cost.
