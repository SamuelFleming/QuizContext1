# Development Queue

Roadmap: [00_MVP-Development-Plan.md](00_MVP-Development-Plan.md). Phases are scoped there. Tickets are written one phase at a time.

## MVP phase outline
| Phase | Goal | State |
|---|---|---|
| 1 | Local foundations + one dual-API vertical slice | Done |
| 2 | Authentication, ownership + foundational persistence | Done |
| 3 | User profile, secure AI key configuration + usage; code organisation refactor | Done |
| 4 | Subjects, recursive topics, Markdown + document ingestion | Roadmapped |
| 5 | OpenAI integration + AI-assisted descriptions | Roadmapped |
| 6 | Quiz generation, completion, evaluation, history + export | Roadmapped |

## Phase 1 order
1. [P1-01](phase1/P1-01-local-applications.md) — done.
2. [P1-02](phase1/P1-02-internal-diagnostic-api.md) — done.
3. [P1-03](phase1/P1-03-connectivity-screen.md) — done.

## Next approved ticket
None. Phase 3 is complete, including the code organisation refactor (P3-05 to P3-08, [pattern-refactor.md](phase3/pattern-refactor.md)). Phase 4 tickets must follow `docs/core-scope/02_high-level-solution.md` §5.1. Run `/plan-phase` for Phase 4 when ready.

## Phase 3 proposed order
1. [P3-01](phase3/P3-01-profile.md) — profile read and update. Done.
2. [P3-02](phase3/P3-02-ai-key-settings.md) — AI access mode and encrypted user key (AES-256-GCM in `server-webApp`). Done.
3. [P3-03](phase3/P3-03-ai-boundary-check.md) — OpenAI boundary, key resolution, `AiUsage` record, connectivity check. Done.
4. [P3-04](phase3/P3-04-usage-summary-limit.md) — usage summary and application-key monthly token limit. Done.
5. [P3-05](phase3/P3-05-code-organisation-convention.md) — folder and layer convention in core scope. Done.
6. [P3-06](phase3/P3-06-server-data-structure.md) — server-data layered structure. Done.
7. [P3-07](phase3/P3-07-server-webapp-structure.md) — server-webApp layered structure. Done.
8. [P3-08](phase3/P3-08-client-structure.md) — client-webApp feature structure. Done.

Open follow-up: a real successful OpenAI call has not been run locally (no key). Set `OPENAI_API_KEY` and `AI_ENABLED=true`, or save a personal key, then use Test connection on Profile. The default model and price table in `server-webApp/src/config/aiConfig.js` are placeholders to verify.

## Phase 2 proposed order
1. [P2-01](phase2/P2-01-user-identity.md) — user record and trusted `X-User-Id`. Done.
2. [P2-02](phase2/P2-02-auth-api.md) — register, login, JWT, current user. Done.
3. [P2-03](phase2/P2-03-auth-shell.md) — auth screens and protected shell. Done.

## Active / blocked
None. The user-identity channel is `X-User-Id` plus the existing internal API key. Password hashing and JWT issuance stay on `server-webApp`.
