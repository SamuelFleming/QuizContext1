# P3-06 — server-data layered structure

**Status:** Done  
**Phase:** 3 (addendum, see [pattern-refactor.md](pattern-refactor.md))  
**Depends on:** P3-05  
**Relevant scope:** `docs/core-scope/02_high-level-solution.md` §5.1

## Objective
Reorganise `server-data/src` into routes, middleware, controllers, repositories, models, constants, config, utils, and openapi without changing behaviour.

## In scope
- Mapping in [pattern-refactor.md](pattern-refactor.md) §2 (server-data).
- Routes become wiring only; handler bodies move unchanged into controllers.
- `/health` and `/diagnostics/database` move from `app.js` into a diagnostics route/controller.
- Replace literal `80` and `["application", "user"]` with `constants/user.js` in controllers and models.
- Split `openapi.js` into `openapi/` fragments with identical serialised content.

## Out of scope
- New endpoints, response or validation changes, load-owned middleware (arrives with Phase 4 resources).

## Acceptance checks
- [x] Server starts; no flat source files remain in `src/` other than `index.js` and `app.js`.
- [x] OpenAPI JSON is identical to the pre-refactor snapshot.
- [x] Keyed user create, by-email, `/users/me` read/patch, AI settings/key, usage create/summary behave as before.
- [x] Missing internal key or `X-User-Id` still returns 401; invalid display name 400; duplicate email 409.

## Implementation notes
Verified by a 37-request smoke script (status and body with ids, tokens and timestamps masked), run against the pre-refactor servers and then against the refactored data API on a side port. Both runs were identical.
