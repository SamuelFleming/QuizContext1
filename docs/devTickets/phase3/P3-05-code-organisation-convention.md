# P3-05 — Code organisation convention

**Status:** Done  
**Phase:** 3 (addendum, see [pattern-refactor.md](pattern-refactor.md))  
**Depends on:** P3-04  
**Relevant scope:** `docs/core-scope/02_high-level-solution.md` §5

## Objective
Write the layered folder convention for all three apps into core scope, so agents and reviewers have one source of truth before code is moved.

## In scope
- Add §5.1 "Code Organisation" to `docs/core-scope/02_high-level-solution.md`: folder trees for `server-data`, `server-webApp`, `client-webApp` and the layer rules.
- Add a short "Code organisation (required)" section to `CLAUDE.md` pointing at §5.1.
- One line each in `.cursor/rules/backend.mdc` and `.cursor/rules/frontend.mdc`.
- Record the audit and mapping in `pattern-refactor.md`; queue P3-05 to P3-08.

## Out of scope
- Moving code (P3-06 to P3-08).
- Changing product scope, API contracts, or design.

## Acceptance checks
- [x] §5.1 lists every folder named in `CLAUDE.md` and states that routes hold no logic, controllers do not call OpenAI/`fetch`/Mongoose directly, and React components do not call `fetch`.
- [x] `CLAUDE.md` and both rules files point to §5.1.
- [x] Queue and Phase 3 README list P3-05 to P3-08.
