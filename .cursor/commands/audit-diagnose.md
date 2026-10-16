# Audit / Diagnose

Investigate a QuizContext bug, build failure, regression, architecture drift, or unclear behaviour. **Do not edit files, write tickets, or create Git commits** unless the user explicitly asks to proceed.

## Instructions

1. Read `CLAUDE.md` and only the ticket, phase plan section, core-scope, or design note that applies.
2. Inspect the relevant code, logs, errors, and docs. Prefer implemented code and live OpenAPI over narrative docs when they disagree. Do not load `docs/reference/source-extract/` unless a specific pattern is needed to explain the issue.
3. Identify:
   - likely cause and affected files
   - whether charter, core-scope, the MVP plan, the current ticket, and code disagree
   - whether each service's live Swagger/OpenAPI matches the routes that exist (`server-webApp` and `server-data` separately; there is no separate API-contract document)
   - whether a change crosses the dual-API boundary: browser calling `server-data`, OpenAI or quiz scoring in `server-data`, a client-supplied user id treated as authority, secrets in logs or responses, or answer keys sent to the Quiz Player before submit
   - the smallest safe fix
   - whether the fix fits the current approved ticket or needs a new one
4. If the fix is local and obvious, ask before editing.
5. If the fix spans several files, changes the API boundary, or is not covered by an approved ticket, propose one ticket or `/plan-phase`. Do not implement it in the audit.

## Output

- Diagnosis
- Evidence from code, logs, or docs
- Proposed fix path
- Risk level
- Recommended next step: stay in diagnosis, apply a small fix after approval, or plan/implement a ticket
