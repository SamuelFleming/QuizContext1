# Development Queue

Roadmap: [00_MVP-Development-Plan.md](00_MVP-Development-Plan.md). Phases are scoped there. Tickets are written one phase at a time.

## MVP phase outline
| Phase | Goal | State |
|---|---|---|
| 1 | Local foundations + one dual-API vertical slice | Done |
| 2 | Authentication, ownership + foundational persistence | Tickets planned |
| 3 | User profile, secure AI key configuration + usage | Roadmapped |
| 4 | Subjects, recursive topics, Markdown + document ingestion | Roadmapped |
| 5 | OpenAI integration + AI-assisted descriptions | Roadmapped |
| 6 | Quiz generation, completion, evaluation, history + export | Roadmapped |

## Phase 1 order
1. [P1-01](phase1/P1-01-local-applications.md) — done.
2. [P1-02](phase1/P1-02-internal-diagnostic-api.md) — done.
3. [P1-03](phase1/P1-03-connectivity-screen.md) — done.

## Next approved ticket
None yet. Phase 2 tickets are written. `/implement-phase` Phase 2 runs P2-01, then P2-02, then P2-03.

## Phase 2 proposed order
1. [P2-01](phase2/P2-01-user-identity.md) — user record and trusted `X-User-Id`. Depends on Phase 1.
2. [P2-02](phase2/P2-02-auth-api.md) — register, login, JWT, current user. Depends on P2-01.
3. [P2-03](phase2/P2-03-auth-shell.md) — auth screens and protected shell. Depends on P2-02.

## Active / blocked
None. The user-identity channel is `X-User-Id` plus the existing internal API key. Password hashing and JWT issuance stay on `server-webApp`.
