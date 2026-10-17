# 8005 — Quiz generate model picker + live estimate UI

**Status:** Done  
**Phase:** 8  
**Depends on:** 8004, 7019  
**Relevant scope:** Quiz generation screen (S04 / F05); preview metrics UI

## Objective
Let the user pick a catalogue model on the generate form (default Luna), see live API-driven cost approximations before deciding to generate, and send the selected model on generate.

## In scope
- Load models from `GET /ai/models`; model `<select>` on the quiz generate form, **prefilled to `gpt-6-luna` (Luna)**.
- When subject + question counts are valid, **debounce** `POST /quizzes/preview` (including `model`) on changes to model, subject, topics, counts, difficulty, or context mode; cancel stale in-flight previews.
- Compact estimate summary visible **before** Generate: input characters, estimated input tokens, estimated input $, output cost ceiling (and total if returned). Clear “estimate / up to” wording. Exact tokens remain post-generate via existing `aiRun`.
- Pass selected `model` on final generate. Keep today’s preparing → generate submit path.
- Layout: readable form with space for model + estimate summary; pair Difficulty/Context or MC/SA on one row only if it stays scannable (do not force three-across).
- Soft-fail live preview errors without blocking the form (message / clear stale estimates).
- Light CSS via existing design tokens.

## Out of scope
- New estimate endpoint or client-invented rates when the API fails.
- Model picker on Profile, evaluation, or description flows.
- Changing Profile / `AiRunDetails` beyond what generate already shows.
- Per-request budget controls (context/output/reasoning).

## Acceptance checks
- [x] Generate form loads catalogue options and defaults the select to Luna.
- [x] Changing model (with a valid subject and counts) refreshes the estimate summary from preview without requiring Generate.
- [x] Summary shows input chars, estimated input tokens, estimated input $, and output ceiling $ with estimate wording.
- [x] Generate request includes the selected `model`; success path still shows exact `aiRun` tokens/cost after completion.
- [x] Live preview failure does not block editing or a later Generate attempt.
- [x] Layout remains readable on desktop and a narrow viewport; no new theme or CareerContext styling.
- [x] Focused verification (build and/or manual browser check) documented.

## Outcome notes
- Model select + debounced live `previewQuiz` estimates on `QuizGeneratePage`; default `gpt-6-luna`.
- Client production build passes. Browser/390px UAT remains manual.

## Implementation notes
- Primary screen: `client-webApp/src/features/quizzes/QuizGeneratePage.jsx`.
- Reuse `previewQuiz` / `generateQuiz` client services; add a thin list-models fetch.
- Debounce interval should feel responsive (~300–500 ms) without spamming context assembly.
