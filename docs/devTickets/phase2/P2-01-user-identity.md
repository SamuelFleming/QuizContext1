# P2-01 — User record and trusted user identity

**Status:** Planned  
**Phase:** 2  
**Depends on:** P1-02  
**Relevant scope:** MVP plan Phase 2; F01

## Objective
Persist a user in `server-data`, and define the one way a verified user id crosses from `server-webApp` with the internal API key.

## In scope
- A User record: unique email, `passwordHash`, and display name. No other collections.
- `passwordHash` is stored only. Ordinary user responses omit it.
- Trusted identity header: `X-User-Id`. `server-data` accepts it only on a request that already has a valid `X-Internal-Api-Key`. The value is the user id `server-webApp` took from a verified JWT. A user id in a JSON body or query is not authority.
- Internal routes, all keyed: create a user, look up a user by email for login (this response may include `passwordHash`), and read the current user by `X-User-Id` without the hash.
- Missing or wrong internal key returns 401 `{ message }`. A current-user read with no `X-User-Id`, or an id that does not exist, returns 401 or 404 `{ message }` and no other user's record.
- Duplicate email returns 409 `{ message }`.
- Update `server-data` Swagger for these routes.

## Out of scope
- Hashing passwords, issuing JWTs, or browser routes. Those are P2-02 and P2-03.
- Profile editing, API keys, subjects, topics, documents, and quizzes.
- `server-data` verifying the JWT itself. The JWT secret stays on `server-webApp`.

## Acceptance checks
- [ ] A keyed create stores a user and does not return `passwordHash`.
- [ ] The keyed email lookup used for login can return the hash. A current-user read cannot.
- [ ] A missing or wrong internal key is 401. A current-user read does not return a different user than `X-User-Id`.
- [ ] Swagger on `server-data` lists the new routes.
- [ ] Verification is those requests. No automated suite is required.

## Implementation notes
Reuse `requireInternalKey` in `server-data/src/internalAuth.js` and the `{ data }` / `{ message }` helpers. Later phases must copy this header pair rather than invent another user-id channel.
