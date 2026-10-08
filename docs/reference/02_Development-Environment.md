# CareerContext Development Environment — Reference for QuizContext.io

CareerContext uses Cursor with **mode-routed agent work**, glob-scoped rules, numbered tickets, and split “intent vs implemented” API docs. That discipline scaled a long-lived MERN app; QuizContext should keep the *mechanisms* and cut the *volume*.

## What exists

| Mechanism | Path | What it does |
|---|---|---|
| Project identity | `CLAUDE.md` | Product, stack, sources of truth, workflow classification, “do not git unless asked” |
| Mode router | `.cursor/rules/workflow-router.mdc` | Always-on: Plan / Develop Large Feature / Implement Ticket / Small Change / Audit |
| Layered rules | `.cursor/rules/{backend,frontend,documentation,ai}.mdc` | Glob-scoped; AI rule **layers on** backend/frontend, does not replace them |
| Commands | `.cursor/commands/*.md` | One command per mode (`implement-dev-task`, `plan-large-feature`, `audit-diagnose`, `small-change`, `develop-large-feature`) |
| Ticket queue | `docs/devTickets/devTickets_next.md` | Phase tables, dependencies, status |
| Completion registry | `docs/devTickets/devCompletion.md` | Shipped work |
| Tickets | `docs/devTickets/phase{N}/` | Numbered files with Status, Depends On, Scope, Out of scope, Acceptance |
| Product specs | `docs/core-scope/00`–`08` | Vision → data model → screens → API contract |
| AI design | `docs/ML-Design/` | `00` overview + `01` provider spec are authoritative; older notes are not |
| Live API mirror | `server/src/openapi/` | Implemented endpoints only; Swagger at `/api/docs` |

There are **no Cursor Skills** in this repo. Hooks (`.cursor/hooks/`) are optional local UX, not part of the implementation contract.

## Conventions that actually steer agents

**1. Classify before editing.** Audit does not change code until findings are reported. Plan Large Feature writes tickets, not `client/`/`server/`. Implement Ticket inspects code first and stops on ticket/docs/code mismatch.

**2. Tickets are the unit of work.** Format (see `.cursor/rules/documentation.mdc`): Status, Phase, Depends On, Related screens/docs, Objective, Scope, Files, Technical tasks, Acceptance checkboxes, **explicit out of scope**. Example of a thin, transferable ticket: `docs/devTickets/phase4/402-ai-service-boundary-and-client.md` (boundary vs persistence split; flows must not talk to the SDK). Implement mode stops if the ticket is ambiguous, architecture would change, or contract and code disagree. Queue updates happen in the same change as implementation.

**3. Two API documents, different jobs.** `docs/core-scope/08_api_contract.md` = design intent (planned + shipped). `server/src/openapi/` = live behaviour only, merged from `openapi.base.json` + `paths/*.json` (`loadOpenApiSpec.js`). The implement command requires an OpenAPI fragment update in the **same** change as any HTTP contract change; `npm run openapi:validate` is the check. Agents edit the matching path file, not the whole spec. For QuizContext’s two servers, one live Swagger each is enough until the API settles — then add an intent contract if drift becomes a problem.

**4. Sources of truth are named in the rule that applies.** Backend: `05` + `08`. Frontend: screens + design system. AI: ML-Design + Phase 4 tickets. This stops agents inventing field names (a real failure mode: `overviewRaw` vs leftover `*Md` suffixes).

**5. User-owned git.** Agents implement and update tickets; they do not commit unless asked (`CLAUDE.md` and every command).

**6. Vertical slices over entity-complete CRUD.** Phase 2 shipped Experience Index/Detail as full-stack slices; Phase 4 shipped the AI *boundary* (402) before each flow. That sequencing is more valuable than CareerContext’s ticket *count*.

## What grew heavy (simplify for QuizContext)

- `CLAUDE.md` plus five rules plus five commands **repeat** workflow text. ChatGPT’s bound (identity ~60–80 lines; backend ~40–50; frontend ~30–40; one implement command; one plan command) is a better target. Put invariants once; commands should *invoke* them.
- Eight numbered core-scope docs plus a large `devTickets_next.md` are expensive context. QuizContext can start with a short index, product theory, flows-to-screens, and a thin API list — plus this `Reference-Exports/` folder instead of pasted source.
- The AI rule’s CareerContext-specific HITL / evidence-hierarchy clauses should **not** be copied. Keep only: AI behind a service boundary, structured output + server validate, log every run, clip context, never invent facts beyond the chosen context mode.
- Do not reproduce Phase 1–5 ticket archaeology. Six QuizContext phases (foundations → auth/data → AI config → content → first AI → quizzing) with **few tickets each** is enough. Prove the dual-API path with one entity before generating the rest of CRUD.
- Prefer **pragmatic verification** (APIs start, auth works, one generate→attempt→evaluate path) over CareerContext’s growing OpenAPI/contract sync burden — keep a live Swagger for both QuizContext servers if you split them, but delay a second “intent” contract until the API has actually settled.

## Suggested QuizContext minimum

1. Short `CLAUDE.md`: vision, dual-API constraint (AI lives in `server-webApp` only), ticket + no-commit rules.
2. Three glob rules: backend, frontend, docs — each pointing at one source-of-truth doc.
3. Two commands: Plan (write tickets only) and Implement (one ticket, update completion notes).
4. `devTickets/` with a single next/completion file until volume forces a split.
5. Reference this export for CareerContext patterns; do not add CareerContext source trees to QuizContext agent context by default.

Prove one vertical slice early (React → `server-webApp` → `server-data` → Mongo for a single entity) before generating the rest of CRUD. That is the CareerContext lesson that matters for a dual-API MVP; the rest of the scaffolding is optional.
