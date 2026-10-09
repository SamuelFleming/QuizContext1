# Development Queue

Roadmap: [00_MVP-Development-Plan.md](00_MVP-Development-Plan.md). Phases are scoped there. Tickets are written one phase at a time.

## MVP phase outline
| Phase | Goal | State |
|---|---|---|
| 1 | Local foundations + one dual-API vertical slice | Done |
| 2 | Authentication, ownership + foundational persistence | Done |
| 3 | User profile, secure AI key configuration + usage | Tickets planned |
| 4 | Subjects, recursive topics, Markdown + document ingestion | Roadmapped |
| 5 | OpenAI integration + AI-assisted descriptions | Roadmapped |
| 6 | Quiz generation, completion, evaluation, history + export | Roadmapped |

## Phase 1 order
1. [P1-01](phase1/P1-01-local-applications.md) — done.
2. [P1-02](phase1/P1-02-internal-diagnostic-api.md) — done.
3. [P1-03](phase1/P1-03-connectivity-screen.md) — done.

## Next approved ticket
None yet. Phase 3 tickets are written. `/implement-phase` Phase 3 runs P3-01, P3-02, P3-03, then P3-04.

## Phase 3 proposed order
1. [P3-01](phase3/P3-01-profile.md) — profile read and update. Depends on P2-03.
2. [P3-02](phase3/P3-02-ai-key-settings.md) — AI access mode and encrypted user key (AES-256-GCM in `server-webApp`). Depends on P3-01.
3. [P3-03](phase3/P3-03-ai-boundary-check.md) — OpenAI boundary, key resolution, `AiUsage` record, connectivity check. Depends on P3-02.
4. [P3-04](phase3/P3-04-usage-summary-limit.md) — usage summary and application-key monthly token limit. Depends on P3-03.

Decisions to confirm before implementing: the encryption method in P3-02, the limit unit (monthly application-key tokens) in P3-04, and that profile editing covers display name only in P3-01. Running P3-03/P3-04 success paths needs a real OpenAI key locally.

## Phase 2 proposed order
1. [P2-01](phase2/P2-01-user-identity.md) — user record and trusted `X-User-Id`. Done.
2. [P2-02](phase2/P2-02-auth-api.md) — register, login, JWT, current user. Done.
3. [P2-03](phase2/P2-03-auth-shell.md) — auth screens and protected shell. Done.

## Active / blocked
None. The user-identity channel is `X-User-Id` plus the existing internal API key. Password hashing and JWT issuance stay on `server-webApp`.
