# 9010 — Hosted compose scaffold

**Status:** Planned  
**Phase:** 9 (ops, parallel to 9002–9008)  
**Depends on:** Release-2 artefact (`8583124`, includes 9000–9001). Does not depend on 9002–9008, a live VM, or DNS.  
**Relevant scope:** Charter dual-API boundary; Phase 1 local process model; first non-prod host

## Objective
Make Release-2 start from Docker Compose as two containers, with `server-webApp` serving the compiled React app, so a later first INT cutover (9011) only has to provision the host. Do not stand up the live environment in this ticket.

## Planning decisions (locked)

1. **INT, not prod.** One future hosted environment. No prod stack, no prod secrets, no second cluster. Environment name **INT** (database `quizcontext-int`). Git branch **`dev-deploy`**.
2. **The environment is long-lived; the git branch is not a fork of the product.** Updating INT later means pointing the host at a newer git ref that already contains this scaffold. Do not land feature commits only on `dev-deploy`.
3. **`Release-2` stays an unmerged artefact.** Tag `8583124` as `first-use-9001` **before** that branch receives the planning cherry-pick.
4. **Implement on `dev-deploy` cut from `Release-2`** (after the 9010/9011 planning files are on it), then merge into `Phase9-historyEnhance`. Do not implement by editing 9002–9008 files.
5. **`main` is not the deploy source yet.** Deploy from `dev-deploy` / `Phase9-historyEnhance` until a later catch-up PR.
6. **Keep three processes.** Browser → `server-webApp` only. `server-data` must not be internet-reachable. Mongo stays outside both Express apps (Atlas via `MONGODB_URI`).
7. **Host A (approved):** one small Linux VM + Docker Compose + MongoDB Atlas. Not Vercel, Cloudflare Pages/Workers, Railway, or another PaaS.
   - Compose runs two services: `server-data` and `server-webApp`.
   - `server-data` is published only on the Compose network, not on a public host port.
   - `server-webApp` is bound to `127.0.0.1` on the host (local verify may publish that loopback port).
   - `server-webApp` serves `client-webApp/dist` so INT will have **one public URL**.
   - Local `npm start` (Vite on 5017) stays unchanged.
8. **This ticket is compose + hosted-profile code only.** The live runbook, Caddy, DNS, and first deploy are [9011](9011-int-runbook-cutover.md). Do not add a `docs/deploy/` tree.
9. **Env contract is the names already used locally.** This ticket may add hosted *values* and a compose file. It does not invent new product env vars.
   - `server-data`: `PORT`, `MONGODB_URI`, `INTERNAL_API_KEY`
   - `server-webApp`: `PORT`, `CLIENT_ORIGIN`, `DATA_API_BASE_URL`, `INTERNAL_API_KEY`, `JWT_SECRET`, `AI_KEY_ENCRYPTION_KEY`, `OPENAI_API_KEY`, `AI_ENABLED`, existing AI timeout/limit vars
   - client build: `VITE_WEB_API_BASE_URL` (empty / same-origin for the hosted image)
10. **Same INT database for later Phase 9 deploys.** 9002–9008 add no new collection and need no backfill. First INT database starts empty (9011). Encrypted user AI keys only decrypt with the **same** `AI_KEY_ENCRYPTION_KEY` used when they were saved.
11. **INT hostname (for compose/CORS values only).** Intended public origin is `https://int.quizcontext.app`. Confirm the Cloudflare zone spelling before baking it in; the purchase note read `quizconmtext.app` (extra `m`). Apex stays parked — that is not production.

Rejected for INT: three public URLs with only `INTERNAL_API_KEY` protecting `server-data`.

## In scope
- Dockerfiles that build `server-data` and `server-webApp` independently. The webApp image includes a production `client-webApp` build.
- Compose file: existing env names, restart policy, `server-data` not published publicly, `server-webApp` on loopback only.
- Hosted-profile code only:
  - longer Mongo `serverSelectionTimeoutMS` for Atlas
  - `server-webApp` static serve of `client-webApp/dist` when configured
  - SPA fallback for client routes (`/dashboard`, `/subjects/:id`, and so on) that does **not** swallow `/health`, `/auth`, `/api/docs`, or other existing Express routes (they are at the URL root today, not under `/api`)
  - do not mount data-API Swagger on a public NIC (keep `/health`)
- Stop gitignoring `package-lock.json` so hosted `npm ci` is possible (or document why `npm install` is accepted).
- Tag `first-use-9001` on `8583124` (if not already tagged).
- Merge the 9010 scaffold commit(s) into `Phase9-historyEnhance` after they exist on `dev-deploy`.

## Out of scope
- Provisioning a VM, buying/configuring DNS, Caddy/HTTPS, Cloudflare Access, or a live INT smoke test (9011).
- Production environment, CI, preview apps per PR.
- Merging `Release-2` or Phase 9 into `main`.
- Migrating the local first-usage Mongo database.
- Changing quiz/history product behaviour, OpenAI prompts, or 9002–9008 work.
- Adding or renaming product environment variables.
- Rate limiting, Helmet, WAF, secrets managers, key rotation UI.
- Collapsing `server-data` into `server-webApp`.
- PaaS / Vercel / Cloudflare Pages as the app host.

## Acceptance checks
- [ ] `8583124` is tagged `first-use-9001`; `Release-2` stays unmerged.
- [ ] `dev-deploy` contains Release-2 + 9010/9011 planning + the compose scaffold (no 9002–9008 product commits required).
- [ ] Compose comes up locally (or in a one-off VM) against an Atlas URI: `GET /health` on `server-webApp` succeeds; Diagnostics or the webApp→data→Mongo path is ok.
- [ ] Refreshing a client route such as `/dashboard` returns the SPA, not a 404; `/health` and `/auth` still hit Express.
- [ ] Browser cannot reach `server-data` (connection refused / not routed). `INTERNAL_API_KEY` is not in any client bundle.
- [ ] Answer keys still stay off the Quiz Player until submit (unchanged).
- [ ] `Phase9-historyEnhance` can merge `dev-deploy` with no conflict in 9002–9008 files.
- [ ] `.env` / keys / `ket.txt` are not committed.
- [ ] No new product env var names were added.

## Implementation notes
- Cut: `git switch -c dev-deploy Release-2` (after the 9010 and 9011 files are on that branch) then add compose / hosted-profile files. Touch existing app files only for the hosted-profile items above.
- Reuse existing `GET /health` on both APIs. Do not add a new diagnostics product.
- Hosted `CLIENT_ORIGIN` is the public origin (`https://int.quizcontext.app`) or same-origin. Compose `DATA_API_BASE_URL` should use the Compose service name, not `localhost`.
- Healthchecks are optional; a restart policy is not.
- Do not commit hosted secrets.

## Git motion

Planning files (9010 and 9011) are written on `Phase9-historyEnhance`, then cherry-picked onto `Release-2` (tag first). Implement 9010, then 9011, on `dev-deploy`.

```text
Release-2  (tag first-use-9001 on 8583124 — immutable first-usage tree)
    \
     + planning cherry-pick (9010 + 9011 files)
         \
          dev-deploy          ← implement 9010, then 9011
              \
               merge -------> Phase9-historyEnhance   (continue 9002–9008)
                                   \
                                    later PR into main, then INT can track main
```

Until that later PR exists, deploy from `dev-deploy` / `Phase9-historyEnhance`, not from `main`.
