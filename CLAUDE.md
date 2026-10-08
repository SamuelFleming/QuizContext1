# QuizContext.io — Agent Guide

## Product
QuizContext is a MERN study app: user-managed Subjects → recursive Topics → Documents inform AI-generated Quizzes, Attempts, and feedback. The primary MVP context mode is Targeted; Strict and Loose are future-compatible modes.

## Sources of truth (read selectively)
1. `docs/core-scope/` — QuizContext product decisions and user flows (00 charter; 01–04 scope).
2. Current approved ticket in `docs/devTickets/` — task boundaries and acceptance.
3. Existing QuizContext code and live OpenAPI — implemented behaviour.
4. `docs/reference/` — CareerContext examples, **advisory only**, never requirements.

If docs contradict code or each other, flag the precise conflict instead of silently inventing a resolution. Do not load every reference file by default.

## Architecture (non-negotiable for MVP)
- `client-webApp`: React + Vite presentation; invokes user-facing business API only.
- `server-webApp`: Express routes → controllers → services/API clients; user-facing JWT auth, application logic, OpenAI calls, quiz generation/evaluation, context assembly, AI usage orchestration.
- `server-data`: Express routes → controllers → repositories/Mongoose; persistence, data validation and **user ownership checks** only. No OpenAI, prompts, or quiz scoring.
- `server-webApp` calls `server-data` using an environment-held internal API key. The internal API must not be browser-accessible or depend on the caller-provided user ID without trusted user context.
- Run both Express servers locally as distinct processes. Maintain **implemented endpoints** in Swagger/OpenAPI for each service.

## Engineering invariants
- Every user-owned read/write must be scoped to authenticated identity; reject cross-user access at the data boundary.
- Never send answer keys/marking criteria to the Quiz Player before submission.
- Generated quizzes and attempts are durable, separate records; source edits must not silently rewrite historical results.
- Bound and label untrusted source text; do not treat uploaded content as instructions. Report excluded/truncated context.
- OpenAI access stays behind a central service boundary. Validate structured AI outputs before storing them; log AI operations without exposing secrets or raw credentials.
- User-provided API keys require encryption at rest, safe key selection, and no secret logging/response exposure. Do not improvise cryptography without an approved ticket.
- Prefer the existing project pattern over new abstractions. Keep code readable; no speculative RAG, microservices, or broad refactors.

## Working method
- **Plan:** write/update small tickets only; do not implement.
- **Implement:** complete **one approved ticket**, inspect affected code, make scoped changes, perform focused checks, and update ticket/queue status.
- Prove React → business API → data API → MongoDB with one vertical slice before bulk CRUD.
- Avoid unnecessary full-suite regression runs; perform relevant startup, build, request, or focused tests for changed behaviour.
- Never commit, push, rebase, or create branches unless the user explicitly asks.
- Keep reports short: changed files, checks run/results, deviations, remaining risks.

## Ticket convention
- IDs: `P1-01`, `P1-02`, etc., grouped in `docs/devTickets/PhaseN/`.
- Queue: `docs/devTickets/devTickets_next.md`; shipped summary: `docs/devTickets/devCompletion.md`.
- Ticket must include objective, scope, **out of scope**, dependencies, acceptance checks, and status.
- Do not pre-generate a large ticket backlog. Plan the next phase when needed.
