# P3-01 — Profile read and update

**Status:** Done  
**Phase:** 3  
**Depends on:** P2-03  
**Relevant scope:** MVP plan Phase 3; F02; S08

## Objective
The signed-in user can view and edit their basic profile on the Profile screen.

## In scope
- Editable field: `displayName`. Email is shown read-only.
- `server-data`: keyed `PATCH /users/me` scoped by `X-User-Id` (the P2-01 header pair). It updates only allowed fields and ignores or rejects anything else, including `email`, `passwordHash`, and any user id in the body. Returns the user without `passwordHash`.
- `server-webApp`: `PATCH /users/me` behind `requireAuth`. Validate `displayName` (required, trimmed, max 80 characters). Invalid input returns 400 `{ message }`.
- Client: replace the Profile placeholder with a form showing email and an editable display name, with saving, success, and error states. The header name updates after save.
- Update Swagger on both APIs.

## Out of scope
- Changing email or password.
- AI settings (P3-02 onward).
- Account deletion.

## Acceptance checks
- [x] From the browser, a user changes their display name; Dashboard and header show the new name after reload.
- [x] An empty or over-long display name returns 400 and the form shows the message. (The input caps at 80 characters, so over-long was checked by request.)
- [x] A body containing `email`, `passwordHash`, or another user's id does not change those values or another user's record.
- [x] No token returns 401. `server-data` without the internal key or `X-User-Id` returns 401.
- [x] Swagger on both APIs lists `PATCH /users/me`.

## Implementation notes
Follow `server-data/src/userRoutes.js` and `server-webApp/src/userRoutes.js`. Use an explicit allow-list for updatable fields.
