# P2-02 — Registration, login, and current user

**Status:** Planned  
**Phase:** 2  
**Depends on:** P2-01  
**Relevant scope:** MVP plan Phase 2; F01; S01

## Objective
A caller of `server-webApp` can register, log in, and read only the signed-in user.

## In scope
- Hash passwords with bcrypt in `server-webApp` before they are sent to `server-data`. Compare hashes on login in `server-webApp`.
- `POST /auth/register` and `POST /auth/login`. Require an email, a display name on register, and a password of at least 8 characters. Invalid input returns 400 `{ message }`.
- Unknown email and wrong password both return the same 401 message, so the response does not reveal which one failed.
- Issue a JWT on success. `JWT_SECRET` lives in the `server-webApp` environment and is added to `.env.example` only. The token payload's user id is the only user identity the server trusts.
- `GET /users/me` requires `Authorization: Bearer`. It calls `server-data` with the internal API key plus `X-User-Id` from that token, and returns the user without `passwordHash`.
- Missing, invalid, or expired tokens return 401 `{ message }`.
- Do not log passwords, hashes, the JWT secret, or the internal API key.
- Update `server-webApp` Swagger for these routes.

## Out of scope
- The React screens (P2-03).
- Profile update, logout storage, API keys, and any content collection.
- Accepting `userId` from the browser body.

## Acceptance checks
- [ ] Register then login returns a token. `GET /users/me` with that token returns the same user and no password hash.
- [ ] A short password is rejected. A duplicate email is a conflict message. A wrong password does not say whether the email exists.
- [ ] `GET /users/me` without a token is 401, and `server-data` is not asked to use a body-supplied user id.
- [ ] Swagger on `server-webApp` lists the auth and current-user routes.
- [ ] Verification is those requests.

## Implementation notes
Extend `server-webApp/src/dataClient.js` for the user calls. Keep using ports from each app's `.env`: client 5017, business API 4017, data API 4007.
