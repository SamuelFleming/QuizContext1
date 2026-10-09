# P3-04 — Usage summary and application-key limit

**Status:** Planned  
**Phase:** 3  
**Depends on:** P3-03  
**Relevant scope:** MVP plan Phase 3; F02; S08

## Objective
The user sees a simple summary of their AI usage, and calls on the application key stop once a basic per-user limit is reached.

## In scope
- `server-data`: keyed usage summary scoped by `X-User-Id`. It returns totals for the current calendar month (UTC), split by `providerMode`: call count, input and output tokens, and estimated cost. It also returns the five most recent records (operation, status, model, tokens, cost, time).
- `server-webApp`: `GET /settings/ai/usage` behind `requireAuth`.
- **Limit:** before any `application`-mode call, the AI boundary reads this month's application-mode token total and refuses with `AI_LIMIT_REACHED` (429) when it is at or above `AI_APP_MONTHLY_TOKEN_LIMIT` (env, with a small default). The refused call is recorded as `failed` with that code. `user`-mode calls are not limited.
- The settings status reports the limit and the remaining application tokens.
- Client: a "Usage this month" panel on the Profile screen with totals, remaining application allowance, and the recent list. Show empty and error states.
- Add `AI_APP_MONTHLY_TOKEN_LIMIT` to `.env.example`. Update Swagger on both APIs.

## Out of scope
- Billing, payments, charts, and per-operation limits.
- Limits on user-provided keys.

## Acceptance checks
- [ ] After one or more checks, the panel shows matching call count, tokens, and cost.
- [ ] With the limit set below current usage, an `application`-mode check returns `AI_LIMIT_REACHED`, while a `user`-mode check (if a key is available) still runs.
- [ ] A second user's summary does not include the first user's records.
- [ ] Account access works while the limit is reached.
- [ ] Swagger on both APIs lists the usage routes.
- [ ] Focused verification may lower the limit via env. A real OpenAI key is needed only for the success path; otherwise document it as unrun.

## Implementation notes
Put the limit check inside the P3-03 boundary, so Phase 5 and Phase 6 calls inherit it.
