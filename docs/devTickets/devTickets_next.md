# Development Queue

Roadmap: [00_MVP-Development-Plan.md](00_MVP-Development-Plan.md). Phases are scoped there. Tickets are written one phase at a time.

## MVP phase outline
| Phase | Goal | State |
|---|---|---|
| 1 | Local foundations + one dual-API vertical slice | Done |
| 2 | Authentication, ownership + foundational persistence | Done |
| 3 | User profile, secure AI key configuration + usage; code organisation refactor | Done |
| 4 | Subjects, recursive topics, Markdown + document ingestion | Done |
| 5 | OpenAI integration + AI-assisted descriptions | Done |
| 6 | Quiz generation, completion, evaluation, history + export | Ticketed |

## Phase 1 order
1. [P1-01](phase1/P1-01-local-applications.md) — done.
2. [P1-02](phase1/P1-02-internal-diagnostic-api.md) — done.
3. [P1-03](phase1/P1-03-connectivity-screen.md) — done.

## Next approved ticket
[P6-01](phase6/P6-01-quiz-generation-api.md) — quiz generation API and persistence. Generation should call `assembleContext(userId, { subjectId, topicId, includeDescendants, contextMode })` in `server-webApp/src/services/contextService.js`, block on `insufficient`, and pass `promptVersion` and context counts to `runAiOperation`. Evaluation (P6-04) uses the stored snapshot, not a live re-resolve. Planning decisions are in the [Phase 6 README](phase6/README.md).

## Phase 6 proposed order
1. [P6-01](phase6/P6-01-quiz-generation-api.md) — generation API, quiz persistence, study-view projection.
2. [P6-02](phase6/P6-02-quiz-generation-ui.md) — generation form and saved-quiz detail.
3. [P6-03](phase6/P6-03-attempt-player.md) — attempts and Quiz Player (no marking).
4. [P6-04](phase6/P6-04-attempt-evaluation-api.md) — submit evaluates; MC by comparison, short answer via AI.
5. [P6-05](phase6/P6-05-quiz-results.md) — results screen and evaluation-failed retry.
6. [P6-06](phase6/P6-06-library-repeat-export.md) — library, history, delete, export, dashboard, phase close-out.

## Phase 5 proposed order
1. [P5-01](phase5/P5-01-context-package.md) — context resolver, data API source read with document content, budget, truncation and insufficient-content reporting, context-mode input. Done.
2. [P5-02](phase5/P5-02-description-suggestion-api.md) — description suggestion route, versioned prompt and validator, `AiUsage` run-log fields. Done.
3. [P5-03](phase5/P5-03-description-suggestion-ui.md) — workspace suggest, review, accept, and discard; phase close-out. Done.

Planning decisions (`AiUsage` as the run log, character budget, `very_strict` naming) are listed in the [Phase 5 README](phase5/README.md).

## Phase 4 proposed order
1. [P4-01](phase4/P4-01-subjects.md) — subject CRUD, Subjects screen, Dashboard list. Done.
2. [P4-02](phase4/P4-02-topic-tree.md) — recursive topic tree and subtree delete. Done.
3. [P4-03](phase4/P4-03-markdown-notes.md) — Markdown description and notes with safe preview. Done.
4. [P4-04](phase4/P4-04-document-upload-review.md) — document upload, extraction, review, save. Done.
5. [P4-05](phase4/P4-05-document-edit-delete.md) — document edit/delete, cascades, phase close-out. Done.

Planning decisions (hard delete with cascade, no topic move, no stored originals, limits) are listed in the [Phase 4 README](phase4/README.md).

## Phase 3 proposed order
1. [P3-01](phase3/P3-01-profile.md) — profile read and update. Done.
2. [P3-02](phase3/P3-02-ai-key-settings.md) — AI access mode and encrypted user key (AES-256-GCM in `server-webApp`). Done.
3. [P3-03](phase3/P3-03-ai-boundary-check.md) — OpenAI boundary, key resolution, `AiUsage` record, connectivity check. Done.
4. [P3-04](phase3/P3-04-usage-summary-limit.md) — usage summary and application-key monthly token limit. Done.
5. [P3-05](phase3/P3-05-code-organisation-convention.md) — folder and layer convention in core scope. Done.
6. [P3-06](phase3/P3-06-server-data-structure.md) — server-data layered structure. Done.
7. [P3-07](phase3/P3-07-server-webapp-structure.md) — server-webApp layered structure. Done.
8. [P3-08](phase3/P3-08-client-structure.md) — client-webApp feature structure. Done.

Open follow-up (still open after Phase 5, which was verified against a mocked provider): a real successful OpenAI call has not been run locally (no key). Set `OPENAI_API_KEY` and `AI_ENABLED=true`, or save a personal key, then use Test connection on Profile. The default model and price table in `server-webApp/src/config/aiConfig.js` are placeholders to verify.

## Phase 2 proposed order
1. [P2-01](phase2/P2-01-user-identity.md) — user record and trusted `X-User-Id`. Done.
2. [P2-02](phase2/P2-02-auth-api.md) — register, login, JWT, current user. Done.
3. [P2-03](phase2/P2-03-auth-shell.md) — auth screens and protected shell. Done.

## Active / blocked
None. The user-identity channel is `X-User-Id` plus the existing internal API key. Password hashing and JWT issuance stay on `server-webApp`.
