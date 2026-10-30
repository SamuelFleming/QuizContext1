# 9010 — INT deployment scaffold (first hosted environment)

**Status:** Planned  
**Phase:** 9 (ops, parallel to 9004–9008)  
**Depends on:** Release-2 artefact (`8583124`, includes 9000–9001). Does not depend on 9002–9008.  
**Relevant scope:** Charter dual-API boundary; Phase 1 local process model; first non-prod host

## Objective
Make the first-usage app (Release-2) frictionlessly deployable to one long-lived **INT** environment, then merge that same scaffold into `Phase9-historyEnhance` so 9002–9008 can ship to the **same** environment later. Do not invent a production environment.

## Planning decisions (locked)

1. **INT, not prod.** One hosted environment. No custom prod domain, no prod secrets, no second cluster. Name the environment **INT** (or `quizcontext-int`) and the git branch **`dev-deploy`** so “dev” is not two different things.
2. **The environment is long-lived; the git branch is not a fork of the product.** Atlas + VM persist. Updating INT means pointing the host at a newer git ref that already contains this scaffold. Do not use `dev-deploy` as a second product line: if feature commits land there and not on `Phase9-historyEnhance`, INT and local work fork.
3. **`Release-2` stays an unmerged artefact.** Tag `8583124` as `first-use-9001` **before** that branch receives the planning cherry-pick, so the first-usage tree cannot move.
4. **Implement scaffold on `dev-deploy` cut from `Release-2` (after the 9010 planning file is on it)**, then merge `dev-deploy` into `Phase9-historyEnhance`. Do not implement 9010 by editing 9002–9008 files.
5. **`main` is not the deploy source yet.** `origin/main` is Phase 8 (through PR #13 / `Phase8-AiExperiment`). Quiz instructions (9000–9001) and this first-usage tree live only on `Release-2` / `Phase9-historyEnhance`. Catching `main` up is a later PR, not this ticket.
6. **Keep three processes.** Browser → `server-webApp` only. `server-data` must not be internet-reachable. Mongo stays outside both Express apps.
7. **Host A (approved):** one small VM + Docker Compose + MongoDB Atlas.
   - Compose runs two services: `server-data` and `server-webApp`.
   - Atlas is `MONGODB_URI` (not a Compose Mongo).
   - `server-data` is published only on the Compose network, not on a public host port.
   - `server-webApp` serves `client-webApp/dist` so INT has **one public URL**.
   - Local `npm start` (Vite on 5017) stays unchanged. `VITE_WEB_API_BASE_URL` may be empty/same-origin for that hosted build.
8. **Scaffold is compose + existing env names + a one-page runbook.** The runbook is a 9010 *implement* deliverable (`docs/getting-started-hosted.md`). Do not add a `docs/deploy/` tree.
9. **Env contract is the names already used locally.** This ticket may add hosted *values* and a compose file. It does not invent new product env vars.
   - `server-data`: `PORT`, `MONGODB_URI`, `INTERNAL_API_KEY`
   - `server-webApp`: `PORT`, `CLIENT_ORIGIN`, `DATA_API_BASE_URL`, `INTERNAL_API_KEY`, `JWT_SECRET`, `AI_KEY_ENCRYPTION_KEY`, `OPENAI_API_KEY`, `AI_ENABLED`, existing AI timeout/limit vars
   - client build: `VITE_WEB_API_BASE_URL` (empty or public webApp URL)
10. **Same INT database for later Phase 9 deploys.** 9002–9008 add no new collection and need no backfill. 9002 only adds an Attempt index and changes read paths. Release-2 data remains readable. `quizInstructions` is already on Release-2 (9000).
11. **Local personal Mongo is not the INT database.** First INT deploy starts empty unless a deliberate `mongodump` / `mongorestore` is done. Encrypted user AI keys only decrypt with the **same** `AI_KEY_ENCRYPTION_KEY` used when they were saved.

Rejected for INT: three public URLs with only `INTERNAL_API_KEY` protecting `server-data`. That violates the charter boundary even if the key is long.

## In scope
- Compose file that starts `server-data` and `server-webApp`, injects the existing env names, and does **not** publish `server-data` to a public port.
- Small hosted-profile code only:
  - longer Mongo `serverSelectionTimeoutMS` for Atlas
  - `server-webApp` static serve of `client-webApp/dist` when configured
  - do not mount data-API Swagger on a public NIC (keep `/health` for the platform)
- Stop gitignoring `package-lock.json` so hosted `npm ci` is possible (or document why `npm install` is accepted).
- One runbook page: VM + Compose + Atlas, secrets to generate, first deploy from `dev-deploy`, connectivity check (`GET /health`, existing Diagnostics screen), how to redeploy after merging Phase 9.
- Tag `first-use-9001` on `8583124` (if not already tagged).
- Merge the scaffold commit(s) into `Phase9-historyEnhance` after they exist on `dev-deploy`.

## Out of scope
- Production environment, custom prod domain, CI, preview apps per PR.
- Merging `Release-2` or Phase 9 into `main` (separate catch-up PR).
- Migrating the local first-usage Mongo database (optional note in the runbook only).
- Changing quiz/history product behaviour, OpenAI prompts, or 9002–9008 work.
- Adding or renaming product environment variables.
- Rate limiting, Helmet, WAF, secrets managers, key rotation UI.
- Collapsing `server-data` into `server-webApp`.
- PaaS / private-service host (option B).

## Acceptance checks
- [ ] `8583124` is tagged `first-use-9001`; `Release-2` stays unmerged.
- [ ] `dev-deploy` contains Release-2 + 9010 planning + scaffold (no 9002–9008 product commits required).
- [ ] INT comes up from the runbook: register, sign in, Diagnostics shows webApp + data API + database ok.
- [ ] Browser cannot reach `server-data` (connection refused / not routed). `INTERNAL_API_KEY` is not in any client bundle.
- [ ] Answer keys still stay off the Quiz Player until submit (unchanged).
- [ ] `Phase9-historyEnhance` can merge `dev-deploy` with no conflict in 9002–9008 files.
- [ ] Redeploy instructions for “same INT, newer git ref” are written.
- [ ] `.env` / keys / `ket.txt` are not committed.
- [ ] No new product env var names were added.

## Implementation notes
- Cut: `git switch -c dev-deploy Release-2` (after the 9010 file is on that branch) then add compose / hosted-profile files. Touch existing app files only for the hosted-profile items above.
- Reuse existing `GET /health` on both APIs. Do not add a new diagnostics product.
- `CLIENT_ORIGIN` is a single origin string today. With static files served from `server-webApp`, set it to that public origin (or same-origin and skip CORS mismatch).
- Generate `AI_KEY_ENCRYPTION_KEY` once for INT and keep it. Changing it orphans stored user keys.
- Do not commit hosted secrets. VM env / an untracked override file only.

## Git motion

Planning file is written on `Phase9-historyEnhance`, then cherry-picked onto `Release-2` (tag first). Implement later on `dev-deploy`.

```text
Release-2  (tag first-use-9001 on 8583124 — immutable first-usage tree)
    \
     + planning cherry-pick (9010 file only)
         \
          dev-deploy          ← later: implement 9010; first INT deploy
              \
               merge -------> Phase9-historyEnhance   (continue 9004–9008)
                                   \
                                    later PR into main, then INT can track main
```

Until that later PR exists, deploy from `dev-deploy` / `Phase9-historyEnhance`, not from `main`.
