# P3-07 — server-webApp layered structure

**Status:** Done  
**Phase:** 3 (addendum, see [pattern-refactor.md](pattern-refactor.md))  
**Depends on:** P3-06  
**Relevant scope:** `docs/core-scope/02_high-level-solution.md` §5.1

## Objective
Reorganise `server-webApp/src` into routes, middleware, controllers, services (with `services/dataApi/`), openai, constants, config, utils, and openapi without changing behaviour.

## In scope
- Mapping in [pattern-refactor.md](pattern-refactor.md) §2 (server-webApp).
- Controllers do HTTP translation only; validation and workflow move to services which throw `{ statusCode, expose }` errors via `utils/httpError.js`.
- Split `dataClient.js` per resource under `services/dataApi/`.
- Rename `ai/` to `openai/`; move `aiConfig.js` to `config/`, `keyCrypto.js` to `utils/` with its cryptography unchanged.
- Split `openapi.js` into `openapi/` fragments with identical serialised content.
- Update file paths in `.env.example` comments and docs that name moved files.

## Out of scope
- New endpoints, response or error-message changes, prompt registry, changes to encryption.

## Acceptance checks
- [x] Server starts; no flat source files remain in `src/` other than `index.js` and `app.js`.
- [x] OpenAPI JSON is identical to the pre-refactor snapshot.
- [x] Register (incl. 400s and 409), login (identical 401 message), `GET`/`PATCH /users/me`, `/settings/ai`, `/ai/usage`, `/ai/mode`, `/ai/key` save/remove, `POST /settings/ai/check` return the same bodies as before.
- [x] No token 401; connectivity diagnostic still reports each part.

## Implementation notes
`keyCrypto.js` moved unchanged. The missing-`JWT_SECRET` error stays a hidden 500 (`createHttpError(..., { expose: false })`). Same 37-request smoke script as P3-06, identical to the pre-refactor run; Swagger UI loads on both APIs. `.env.example` named no moved files.
