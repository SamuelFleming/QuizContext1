# P1-01 — Local applications and run conventions

**Status:** Planned  
**Phase:** 1  
**Depends on:** None  
**Relevant scope:** MVP plan Phase 1; charter architecture

## Objective
Create the three local applications and the conventions later tickets will reuse: environment files, start commands, a shared response shape, and Swagger for the routes that exist.

## In scope
- Initialise `client-webApp` (React + Vite), `server-webApp` (Express), and `server-data` (Express) as separate packages.
- Give each app its own start script. Document the three commands in the root README.
- Add `.env.example` for each server and the client. Gitignore `.env`, `node_modules`, and build output. Do not commit secrets.
- Local ports: client `5173`, `server-webApp` `4000`, `server-data` `4001`.
- On both APIs, success responses use `{ data }` and errors use `{ message }` with an HTTP status. A small error handler returns that shape for unexpected failures and does not leak stack traces or environment values.
- `GET /health` on each API returns the service name and an ok status. Publish Swagger for the routes that exist. One Swagger UI per API is enough; do not add a second API-contract document or a fragment-merge toolchain.

## Out of scope
- MongoDB, the internal API client, and the connectivity diagnostic.
- User accounts, JWT, entity models, and OpenAI.
- A shared npm package between the two servers. Duplicate the small response helper in each app.
- Application shell navigation. That starts in Phase 2.

## Acceptance checks
- [ ] Each app starts with its own command on the ports above.
- [ ] `GET /health` on both APIs returns `{ data }` and is listed in that API's Swagger.
- [ ] An unknown route returns `{ message }` and no stack trace.
- [ ] `.env.example` files contain placeholders only. A real `.env` is not committed.
- [ ] Verification is a local start plus the health requests above.

## Implementation notes
Suggested environment names, as placeholders in the examples: `PORT`, and on `server-webApp` only `CLIENT_ORIGIN` (default `http://localhost:5173`). Database and internal-key variables are added in P1-02.
