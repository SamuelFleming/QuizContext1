# 7017 — AI usage pagination

**Status:** Done (API checks verified; browser acceptance checks pending manual UAT)
**Phase:** 7
**Depends on:** 7015, 7016
**Relevant scope:** Phase 7 README; S08; P3-04

## Objective
Profile can page through more than the five newest AI runs. Both APIs accept page and limit, with the public API capped at 25 items and the internal data API capped at 100.

## In scope
- Keep the existing usage summary and its monthly totals. Paginate the existing `recent` list; do not add a second collection or route.
- `GET /settings/ai/usage` accepts `page` and `limit`. Defaults are page 1 and limit 5. `page` is a positive safe integer. `limit` is an integer from 1 to 25. Invalid values return 400.
- `GET /ai-usage/summary` independently accepts the same parameters. Its `limit` maximum is 100. The trusted owner remains `X-User-Id`.
- The response keeps `recent` as the requested page and adds `pagination` with `page`, `limit`, `totalItems`, and `totalPages`.
- Records stay newest first, ordered by `createdAt` and then `_id`. The page is owner-scoped and all-time, matching today's recent list. Monthly totals and the application allowance do not change between pages.
- Profile requests five items per page. Previous and Next sit under the list with "Page X of Y". Controls are hidden for one page, unavailable directions are disabled, and a usage refresh returns to page 1.
- Swagger on both APIs documents the query parameters, bounds, 400 responses, and pagination metadata.

## Out of scope
- A page-size selector, filters, charts, or an export.
- Changing the usage record, failure codes, or the expanded diagnostics from 7015 and 7016.
- Showing source text, prompt instructions, raw model JSON, answer keys, or API keys.

## Acceptance checks
- [x] Defaults return the five newest owner-scoped runs. Pages do not overlap or include another user's runs. The last and empty pages have the correct metadata.
- [x] The data API accepts limit 100 and rejects limit 0, limit 101, and an invalid page with 400.
- [x] The business API accepts limit 25, rejects limit 26 and an invalid page with 400, and forwards a valid page and limit.
- [x] Totals and the application allowance stay the same on every page. Usage JSON contains no answer key or API key.
- [ ] Profile shows five runs per page, Previous/Next works, a refresh returns to page 1, and the controls fit at 390px. Lint and build pass. *(Lint and build verified; browser checks await manual UAT.)*

## Implementation notes
The client currently calls `GET /settings/ai/usage` with no query. `server-data` currently returns a hard-coded newest five. This ticket adds pagination without changing the monthly aggregate.
