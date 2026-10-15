# 7032 — Rename a saved quiz

**Status:** Complete
**Phase:** 7
**Depends on:** 7030
**Relevant scope:** F05; S04; 7030; 7031

## Objective
Let a user change the saved title of an existing quiz without changing its questions, attempts, scope, or generated content.

## In scope
- Add owner-scoped `PATCH /quizzes/:quizId` on both APIs. The only accepted change is `title`.
- Trim the title and require 1–120 characters. Blank, whitespace-only, and longer values return 400. A missing quiz or another user's quiz returns 404.
- The business API takes identity from the JWT and returns the existing study view. It does not expose answer keys, marking criteria, or the source snapshot.
- The data API enforces the same title rule and trusted `X-User-Id` independently. It changes no field other than `title`.
- Add a labelled rename control on the saved-quiz detail screen. Keep the current title available while editing, and show the saved title after success.
- Update both live OpenAPI documents.

## Out of scope
- Editing questions, counts, difficulty, scope, attempts, or exports beyond the title they read from the quiz.
- Renaming from the library, dashboard, player, or generation form.
- Title uniqueness, search, or AI regeneration.

## Likely implementation areas
- `server-data/src/repositories/quizRepository.js`
- `server-data/src/controllers/quizController.js`
- `server-data/src/routes/quizRoutes.js`
- `server-data/src/openapi/paths/quizzes.js`
- `server-webApp/src/services/dataApi/quizzes.js`
- `server-webApp/src/services/quizService.js`
- `server-webApp/src/controllers/quizController.js`
- `server-webApp/src/routes/quizRoutes.js`
- `server-webApp/src/openapi/paths/quizzes.js`
- `client-webApp/src/services/quizService.js`
- `client-webApp/src/features/quizzes/QuizDetailPage.jsx`

## Acceptance checks
- [x] A trimmed title is saved and returned by detail, list, study view, and export.
- [x] Blank, whitespace-only, and over-length titles return 400 and leave the stored title unchanged.
- [x] Questions, attempts, scope, and answer-key fields are unchanged.
- [x] Another user and an unknown quiz return 404. Missing authentication and a missing internal key return 401.
- [x] The public response remains a study view.
- [x] The detail screen can rename a quiz and keeps the saved title visible after success.
- [x] Both OpenAPI documents describe the title-only update.
