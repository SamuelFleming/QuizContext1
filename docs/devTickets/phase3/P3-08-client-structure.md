# P3-08 — client-webApp feature structure

**Status:** Done  
**Phase:** 3 (addendum, see [pattern-refactor.md](pattern-refactor.md))  
**Depends on:** P3-05  
**Relevant scope:** `docs/core-scope/02_high-level-solution.md` §5.1; `04_flows-to-screens.md` S01, S02, S08

## Objective
Reorganise `client-webApp/src` into app, components, context, features, services, and styles, and lift auth state into a context, without changing what the user sees.

## In scope
- Mapping in [pattern-refactor.md](pattern-refactor.md) §2 (client-webApp).
- An auth context (`context/AuthProvider.jsx` + `useAuth`) owns user, initial token check, sign in, sign out; screens read it instead of receiving `user`/`onUnauthorized` props.
- Split `lib/api.js` into `services/apiClient.js` plus one service file per domain.
- Move stylesheets to `styles/`; delete unused Vite scaffold assets.

## Out of scope
- A router library, visual changes, new screens, splitting `app.css` per feature.

## Acceptance checks
- [x] Lint and production build pass.
- [x] Browser: register/login lands on dashboard; Profile rename updates the header; AI access and usage panels load; Diagnostics works signed in and out; logout returns to login.
- [x] An invalid stored token is dropped and the login screen shows.
- [x] Only `services/apiClient.js` calls `fetch`; components use domain services (the auth provider uses the client's token helpers).

## Implementation notes
The auth context is split into `context/authContext.js`, `context/AuthProvider.jsx`, and `context/useAuth.js` so React fast refresh works (lint `only-export-components`). `app/AppRoutes.jsx` holds the route switch; `app/App.jsx` wires navigation into the provider. Lint shows one warning (`set-state-in-effect` in `Diagnostics.jsx`) that already existed before the refactor. Headless Chrome against the refactored stack: 17/17 checks pass, with no console errors.
