/implement-phase  Phase 2

Phase 2 is complete. All three tickets implemented in order, each verified before moving on. Nothing was committed.

P2-01 — User record and trusted identity (server-data)
Changed: models/user.js (User schema + toPublicUser/toAuthUser), userRepository.js, userRoutes.js, added requireUserId to internalAuth.js, mounted /users in app.js, DB connect at startup in index.js, Swagger for the three routes in openapi.js.
Checked (keyed requests): create returns a user with no passwordHash; duplicate email → 409; /users/by-email returns the hash; /users/me returns the same user without the hash; wrong key → 401; missing X-User-Id → 401; unknown id → 404. All PASS. Swagger lists the routes.
P2-02 — Register, login, current user (server-webApp)
Changed: auth.js (bcrypt hash/verify, JWT issue, requireAuth), authRoutes.js (/auth/register, /auth/login), userRoutes.js (GET /users/me), extended dataClient.js with user calls, mounted routes in app.js, JWT_SECRET added to .env.example, Swagger updated.
Checked (requests): register → token + user (no hash); short password → 400; duplicate → 409; login → token; wrong password and unknown email both return the identical 401 message; /users/me with token → same user (no hash); no/bad token → 401. All PASS.
Deviation: used bcryptjs (pure-JS bcrypt) instead of native bcrypt to avoid Windows native-build issues; same hashing scheme.
P2-03 — Auth screens and protected shell (client-webApp)
Changed: rewrote App.jsx into a small path router + auth state; added lib/api.js, pages/AuthPage.jsx, pages/Dashboard.jsx, pages/Placeholder.jsx, pages/Diagnostics.jsx (moved connectivity), components/Shell.jsx; extended App.css with token-based styles.
Checked (headless Chrome, 390px viewport): register lands on dashboard showing name + email; token stored under quizcontext_auth_token; logout clears token and returns to login; bad login and short password show errors and stay on auth; a second user sees only their own account; /diagnostics still works. All 7 PASS. Client lint + production build pass. No OpenAPI change needed.
Boundaries respected
Browser → business API only; business API → data API with the internal key plus trusted X-User-Id derived from the verified JWT; server-data enforces identity and never verifies JWTs or hashes passwords.

Notes / risks
I restarted the running data API (4007) and business API (4017) processes to load the new code (the client dev server on 5017 hot-reloaded). All three are up.
I appended a dev-only JWT_SECRET to server-webApp/.env (couldn't read it, so I only appended if absent). For a real deployment, set a strong secret.
Temp smoke-test scripts and the scratch e2e directory were deleted; server-webApp gained bcryptjs + jsonwebtoken dependencies.
Phase 2 docs updated (tickets marked Done, devCompletion.md, and devTickets_next.md). As per the workflow, I did not plan Phase 3 or commit — review, then commit/push and run /plan-phase for Phase 3 when ready.