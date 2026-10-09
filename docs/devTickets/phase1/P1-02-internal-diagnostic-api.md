# P1-02 — Internal diagnostic path to MongoDB

**Status:** Planned  
**Phase:** 1  
**Depends on:** P1-01  
**Relevant scope:** MVP plan Phase 1; charter dual-API boundary

## Objective
Prove `server-webApp` can reach MongoDB through `server-data`, with the data API closed to the browser.

## In scope
- Connect `server-data` to MongoDB with Mongoose using `MONGODB_URI`.
- Require an environment-held internal API key on `server-data` diagnostic routes. Header name: `X-Internal-Api-Key`. A missing or wrong key returns 401 `{ message }`.
- `server-data` exposes one keyed diagnostic that pings MongoDB and reports whether the database is reachable. No CORS on `server-data`.
- `server-webApp` calls that route through a small internal client. The key and the data-API base URL come from `server-webApp` environment (`DATA_API_BASE_URL`, `INTERNAL_API_KEY`). The browser never receives the key.
- `GET /diagnostics/connectivity` on `server-webApp` returns `{ data }` with three statuses: this API, the data API, and the database. When this API is up, it still returns a body if the data API is unreachable or MongoDB is down, with those parts marked failed.
- Allow the Vite origin (`CLIENT_ORIGIN`) on `server-webApp` only.
- Update each API's Swagger for the routes this ticket adds.

## Out of scope
- The React screen (P1-03).
- User identity, JWT, ownership checks, and any collection or CRUD model.
- OpenAI.
- Accepting a user id from the caller. Phase 2 decides how verified user identity travels with this key.

## Acceptance checks
- [ ] With MongoDB running and the key set, the webApp diagnostic reports all three parts ok.
- [ ] A wrong or missing key is rejected by `server-data` with 401.
- [ ] Stopping MongoDB, or stopping `server-data`, produces a diagnostic body that marks the failed part. The response does not include the key or the connection string.
- [ ] Swagger on both APIs matches the implemented diagnostic routes.
- [ ] Verification is those requests. No automated suite is required.

## Implementation notes
Add the new variables to `.env.example` only. The same internal key value is configured in both servers' local environments. Keep the data-API client in `server-webApp`; `server-data` stays persistence and validation only.
