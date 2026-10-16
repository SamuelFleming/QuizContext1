# P2-03 — Auth screens and protected shell

**Status:** Planned  
**Phase:** 2  
**Depends on:** P2-02  
**Relevant scope:** MVP plan Phase 2; F01; S01; S02; `docs/design/01_design-concept.md`

## Objective
A person can register, log in, and see their own account inside the protected shell.

## In scope
- Public registration and login screens outside the shell (S01). Show validation and auth errors from the API.
- On success, store the JWT in `localStorage` under `quizcontext_auth_token` and open the app.
- A minimal shell with header links for Dashboard, Subjects, Quizzes, and Profile. Dashboard shows the signed-in user's display name and email from `GET /users/me`.
- Subjects, Quizzes, and Profile render a short empty state and do not call new APIs. Profile editing is Phase 3.
- Unauthenticated visits to the shell go to login. A 401 from the API clears the stored token and returns to login.
- A logout action clears the token and returns to login.
- Keep the Phase 1 connectivity screen available at `/diagnostics`.
- Use the existing theme tokens in `client-webApp/src/theme.css`. Do not hard-code hex values.
- The client calls `server-webApp` only, using `VITE_WEB_API_BASE_URL`.

## Out of scope
- Subject, quiz, and profile forms.
- A theme picker.
- Calling `server-data` from the browser.

## Acceptance checks
- [ ] From the browser, a new user can register, land on the dashboard, and see their own name and email.
- [ ] After logout, the shell is not available until login. A second user's login shows that second user, not the first.
- [ ] A failed login or a too-short password shows an error and stays on the auth screen.
- [ ] Colours come from the theme file. The page is usable on a narrow viewport.
- [ ] No OpenAPI change is expected unless the client needs a response-shape fix, in which case update the business API spec in the same change.

## Implementation notes
Replace the current home in `client-webApp/src/App.jsx` with the auth flow. The shell is the first real navigation; do not build the content workspace yet.
