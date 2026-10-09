# P1-03 — Connectivity screen

**Status:** Done  
**Phase:** 1  
**Depends on:** P1-02  
**Relevant scope:** MVP plan Phase 1; `docs/design/01_design-concept.md`

## Objective
Show the dual-API connectivity result in the browser, styled with the Light Mint & Indigo token set.

## In scope
- One page in `client-webApp` that calls `server-webApp` `GET /diagnostics/connectivity` using `VITE_WEB_API_BASE_URL` (default `http://localhost:4000`).
- Display each reported status (web API, data API, database). A successful check is visibly ok. A down database, an unreachable data API, or a failed request to `server-webApp` is visibly failed, not a blank page.
- Add one client theme file that defines the design-concept colours as CSS variables. The page uses those token names and does not hard-code hex values.
- Loading and error states for the check.

## Out of scope
- Header navigation, Dashboard, and other screens. Phase 2 adds the authenticated shell.
- A theme picker. The MVP has one palette.
- Authentication, CRUD, and OpenAI.
- Calling `server-data` from the browser.

## Acceptance checks
- [x] With the stack running, the page shows a successful connectivity result from the full path.
- [x] With MongoDB or `server-data` stopped, the page shows a failed check.
- [x] Colours come from the theme file. The internal API key is not present in the client bundle or the page.
- [x] The page is usable on a narrow viewport.
- [x] Verification is that browser check. No OpenAPI change is expected unless the client requires a response-shape fix, in which case update the webApp spec in the same change.

## Implementation notes
Use a normal page request from the client. Do not add a component library. Inter, or a similar sans-serif stack, is enough typography for this screen.
