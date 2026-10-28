# 9010 — Hosted compose scaffold

**Status:** Planned  
**Phase:** 9 (ops, parallel to 9002–9008)  
**Depends on:** Release-2 artefact tagged `first-use-9001` (`8583124`, includes 9000–9001). Does not depend on 9002–9008, a live Droplet, or DNS.  
**Relevant scope:** Charter dual-API boundary; Phase 1 local process model; D1 packaging only  
**Companion:** [9011](9011-int-runbook-cutover.md) owns Caddy, the hosted runbook, and live cutover. [Operator checklist](../../deployment-operator-checklist.md) owns human cloud-account work. [Evolution plan](../../deployment-evolution-plan.md) owns D2–D6.

## Objective
Package Release-2 so `docker compose` starts `server-data` and `server-webApp`, with the compiled React app served from `server-webApp`, without changing product behaviour or the local Vite workflow. Do not provision INT or write the full hosted runbook in this ticket.

## External prerequisites
None required to finish 9010. An Atlas URI (or local Mongo reachable from Docker) is only needed for the optional full Diagnostics check. Operator cloud work can proceed in parallel using the operator checklist.

## Planning decisions (locked)

1. **D1 / INT only.** One future hosted environment. Database name `quizcontext-int`. No prod stack. Apex `quizcontext.app` is not this ticket.
2. **Git (already in progress — do not redo).** `first-use-9001` already points at `8583124`. Current implement branch is **`dev-deploy`** (cut from Release-2; already contains the 9010/9011 planning files). Do not retag. Do not create another deploy branch. Do not land 9002–9008 product work on `dev-deploy`. After 9010 (and 9011 artefacts), merge `dev-deploy` into `Phase9-historyEnhance`. **`main` is not the deploy source.**
3. **Keep three processes.** Browser → `server-webApp` only. `server-data` is Compose-internal. Mongo is Atlas via `MONGODB_URI` (not a Compose Mongo service).
4. **Host A packaging:** two application images + one Compose file. Not Vercel, Cloudflare Pages, App Platform, Tunnel, Kubernetes, or ECS.
5. **Public origin for hosted values:** `https://int.quizcontext.app`. Loopback publish of `server-webApp` is `127.0.0.1:4017:4017` (container `PORT` stays **4017**). `server-data` `PORT` stays **4007** and is **not** published to the host.
6. **Env names are the local contract.** Do not add product env vars. Compose may supply hosted *values*.
   - `server-data`: `PORT`, `MONGODB_URI`, `INTERNAL_API_KEY`
   - `server-webApp`: `PORT`, `CLIENT_ORIGIN`, `DATA_API_BASE_URL`, `INTERNAL_API_KEY`, `JWT_SECRET`, `AI_KEY_ENCRYPTION_KEY`, `OPENAI_API_KEY`, `AI_ENABLED`, plus existing `AI_TIMEOUT_MS` and other names already in `server-webApp/.env.example`
   - client build: `VITE_WEB_API_BASE_URL`
7. **Local `npm start` unchanged.** Vite remains port **5017**. Do not require Docker for local development.
8. **This ticket is packaging + hosted-profile code.** Caddy, UFW, Cloudflare, Droplet software, and `docs/getting-started-hosted.md` are 9011.
9. **First INT database is empty** (9011). Do not migrate local Mongo here.
10. **No extra access gate in the app.** Public registration stays as in Release-2 (9011). Do not add Cloudflare Access code or basic-auth middleware.

Rejected: publishing `server-data` and relying on `INTERNAL_API_KEY` as the internet boundary.

## In scope

### Images and Compose
- `server-data/Dockerfile` and `server-webApp/Dockerfile` (independent images). WebApp image: production `client-webApp` build then `node src/index.js`.
- Root `docker-compose.yml`: two services, shared Compose network, `restart: unless-stopped`, healthchecks against existing `GET /health`.
- Publish **only** `server-webApp` to the host, bound to **loopback**: `127.0.0.1:4017:4017`.
- Do not publish `server-data`. `DATA_API_BASE_URL` inside Compose uses the Compose service hostname (not `localhost`).
- Reproducible installs: stop gitignoring `package-lock.json` in all three apps (or document why `npm ci` cannot be used). `.dockerignore` so `node_modules`, `.env`, and `dist` are not copied as secrets.
- Compose reads secrets from an **untracked** env file (for example `.env` at repo root or an already-gitignored path). Commit an example with placeholders only.

### Hosted-profile code (minimum)
- Atlas-friendly Mongo timeout in `server-data/src/config/db.js` (today `serverSelectionTimeoutMS: 2000` is too short for Atlas).
- `server-webApp` serves `client-webApp/dist` in the hosted image.
- SPA fallback for history-API paths (`useNavigation` uses `pathname`). Refresh of `/subjects/:id`, `/quizzes/:id`, `/profile`, etc. must return `index.html`.
- Fallback must **not** swallow existing Express routes. Those are at the URL **root**, not under `/api`: `/health`, `/diagnostics/connectivity`, `/auth`, `/users`, `/settings`, `/subjects`, `/topics`, `/documents`, `/quizzes`, `/attempts`, `/study-history`, `/ai`, `/api/docs`.
- Do not publish `server-data` Swagger on a host port. `server-webApp` `/api/docs` may stay as today (INT will expose it through Caddy; acceptable for D1).
- Hosted client must not call `http://localhost:4017`. Today `apiClient.js` uses `import.meta.env.VITE_WEB_API_BASE_URL || "http://localhost:4017"` — an empty string is falsy. Either bake `https://int.quizcontext.app` at image build, or use a same-origin fallback that treats empty as `""` while local `.env` still sets `http://localhost:4017`. Prefer same-origin for the hosted image.
- `CLIENT_ORIGIN=https://int.quizcontext.app` for the hosted container (existing CORS in `server-webApp/src/app.js`).
- Reuse `GET /health` on both apps. Compose healthchecks only; no new diagnostics product.

### Git motion for this ticket
- Implement on existing `dev-deploy`.
- Merge scaffold into `Phase9-historyEnhance` after it exists (9011 files may merge in the same motion). Touch `app.js` only at the static/SPA edge so the later merge with 9002–9008 routes stays small.

## Out of scope
- Droplet, DNS, Caddy, firewall, live HTTPS, classmate smoke test (9011).
- Cloudflare Access, Tunnel, extra registration restrictions.
- Production, CI, GitHub Actions, AWS, a second environment.
- Merging into `main`.
- Local Mongo migration (D2 activity).
- Quiz/history/AI product changes; 9002–9008 work.
- New product env var names.
- Helmet, WAF, secrets manager, rate-limit product, collapsing the two APIs.

## Expected artefacts
- `server-data/Dockerfile`, `server-webApp/Dockerfile`, matching `.dockerignore`
- Root `docker-compose.yml` plus a gitignored env example usage (placeholders committed)
- Tracked `package-lock.json` for `client-webApp`, `server-webApp`, `server-data` (and `.gitignore` update)
- Small edits: `server-data/src/config/db.js`, `server-webApp/src/app.js`, `client-webApp/src/services/apiClient.js` only if required for the empty-baseUrl trap
- No `docs/deploy/` tree; no full `docs/getting-started-hosted.md` (9011)

## Implementation sequence
1. Confirm `git rev-parse first-use-9001` is `8583124` and HEAD is `dev-deploy`. Do not retag or branch.
2. Track lockfiles; exclude them from `.gitignore`.
3. Dockerfiles + `.dockerignore`; webApp image builds the client with a hosted `VITE_WEB_API_BASE_URL` strategy that is not localhost.
4. Hosted-profile code (timeout, static, SPA fallback).
5. Compose: env wiring, loopback publish, no data-API ports, restart, healthchecks.
6. Verify (below). Do not SSH to a Droplet as the 9010 proof.
7. Merge to `Phase9-historyEnhance` when 9010 (and preferably 9011 artefacts) are on `dev-deploy`.

## Acceptance checks
- [ ] `first-use-9001` still is `8583124`; `Release-2` unmerged to `main`; work is on `dev-deploy`.
- [ ] `docker compose build` succeeds from the repo root on the implement machine.
- [ ] Compose starts both services: `GET http://127.0.0.1:4017/health` returns the existing webApp health envelope; `server-data` has **no** published host port (connection refused from the host).
- [ ] With a working `MONGODB_URI` (local or Atlas), `GET http://127.0.0.1:4017/diagnostics/connectivity` shows webApp + data API + database ok (existing Diagnostics contract).
- [ ] `curl -I http://127.0.0.1:4017/profile` (and one `/subjects/dummy`) returns the SPA, not the JSON 404 body from `notFound`; `GET /health` and `GET /auth/...` still hit Express.
- [ ] Hosted client bundle does not contain `INTERNAL_API_KEY` or `http://localhost:4017` as the API base.
- [ ] Answer keys still stay off the Quiz Player until submit (unchanged player contract).
- [ ] Local `cd client-webApp && npm start` still serves Vite on 5017 without Docker.
- [ ] No new product env var names. Secrets and `ket.txt` not committed.
- [ ] `Phase9-historyEnhance` merge of `dev-deploy` does not need 9002–9008 files to be rewritten for this ticket.

## Verification approach
- Compose build + `up` on the implementer’s machine. Atlas is ideal; `mongodb://host.docker.internal:27017/quizcontext` is acceptable for 9010 connectivity.
- Confirm `docker compose ps` / `docker compose port` that only 4017 is mapped, and it is on 127.0.0.1.
- `curl` SPA vs API as in acceptance. Optional: production client bundle search for the internal key.
- Do not require a browser against `int.quizcontext.app` (that is 9011).

## Technical constraints
- Start commands stay `node src/index.js` (`package.json` `start`).
- WebApp currently `app.listen(port)` with no host argument — inside Docker that is correct; **host** isolation is Compose’s `127.0.0.1:4017:4017`, not a Node listen-host change unless listen-all on the VM would otherwise leak (it must not: no public publish).
- Mongoose connect is `server-data/src/config/db.js`.
- Client routing is pathname + `pushState`, not a hash router.
- `AI_APP_MONTHLY_TOKEN_LIMIT` is still in `.env.example`, but Phase 8 experiment wiring reads the limit from `server-webApp/src/constants/aiExperiment/baseline.js` (100000), not that env var. Do not “fix” that in 9010; 9011 runbook must state the **actual** spend control.
- 2 GB Droplets can strain during image build — Compose must still be buildable; 9011 may note swap. Not a 9010 scope increase.
