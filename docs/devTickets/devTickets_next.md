# Development Queue

Roadmap: [00_MVP-Development-Plan.md](00_MVP-Development-Plan.md). Phases are scoped there. Tickets are written one phase at a time.

## MVP phase outline
| Phase | Goal | State |
|---|---|---|
| 1 | Local foundations + one dual-API vertical slice | Tickets planned |
| 2 | Authentication, ownership + foundational persistence | Roadmapped |
| 3 | User profile, secure AI key configuration + usage | Roadmapped |
| 4 | Subjects, recursive topics, Markdown + document ingestion | Roadmapped |
| 5 | OpenAI integration + AI-assisted descriptions | Roadmapped |
| 6 | Quiz generation, completion, evaluation, history + export | Roadmapped |

## Phase 1 proposed order
1. [P1-01](phase1/P1-01-local-applications.md) — local applications, health, errors, Swagger.
2. [P1-02](phase1/P1-02-internal-diagnostic-api.md) — internal API key and MongoDB diagnostic. Depends on P1-01.
3. [P1-03](phase1/P1-03-connectivity-screen.md) — connectivity screen. Depends on P1-02.

## Next approved ticket
None yet. Review the three tickets, then approve P1-01 for `/implement-ticket`.

## Active / blocked
None. No open product decision. Local ports, the `X-Internal-Api-Key` header, and the `{ data }` / `{ message }` envelopes are set in the tickets. MongoDB must be running locally before P1-02 can pass.
