# Small Change

Make a tiny, obvious, low-risk QuizContext edit. Read `CLAUDE.md` only for the rule that applies.

## Instructions

1. Make the smallest safe change that satisfies the request.
2. Follow the existing layer layout. Do not add a flat file under `src/`, and do not invent a new architecture.
3. Do not refactor unrelated code.
4. Keep the two APIs apart. The browser calls `server-webApp` only. `server-data` does not call OpenAI or score quizzes. Do not trust a caller-supplied user id.
5. Do not write a dev ticket unless the change affects an API, a data model, routing, or more than one feature. A ticket-sized change stops; see Escalation.
6. If an implemented endpoint changes, update that service's live OpenAPI in the same edit: `server-webApp/src/openapi/` and `server-data/src/openapi/` separately. Edit the affected `paths/<domain>.js`. Touch `components.js` only when a shared schema changes.
7. Do not send answer keys or marking criteria to the Quiz Player before submit. Do not log or return secrets.
8. Run one focused check if practical (build, request, or the changed screen). For a visible UI change, exercise the affected flow.
9. Do not commit, push, or create a branch unless the user explicitly asks.
10. Report files changed, what changed, and whether any checks were run.

## Escalation

If the change spans several files, an API contract, the data model, routing, or feature behaviour, stop and recommend `/implement-ticket` or `/audit-diagnose`. Do not start that work inside Small Change.

If a small API edit is requested without the matching OpenAPI update, finish that update before reporting the change done.
