# 9011 — INT runbook and first cutover

**Status:** In progress — `Caddyfile` and `docs/getting-started-hosted.md` are written on `dev-deploy`. Live HTTPS, register, Diagnostics, closed public Express ports, and reboot are not done. The operator runs that cutover from the runbook. Do not merge into `Phase9-historyEnhance` until explicitly asked. Commit and push this branch before a Droplet clone can see the new files.  
**Phase:** 9 (ops, parallel to 9002–9008)  
**Depends on:** [9010](9010-int-deployment-scaffold.md) Compose scaffold on `dev-deploy`; operator Droplet + DNS + Atlas from [deployment-operator-checklist.md](../../reference/Deployment/deployment-operator-checklist.md).  
**Relevant scope:** D1 live host; charter dual-API boundary  
**Companion:** [Evolution plan](../../reference/Deployment/deployment-evolution-plan.md) (D2–D6, including D2 data migration). Do not implement those here.

## Objective
Document and execute the first INT cutover so `https://int.quizcontext.app` serves Release-2 with HTTPS, the existing register/login flow, and `server-data` unreachable from the internet. Do not invent production, CI, or extra auth gates.

## External prerequisites (human)
The operator checklist is the chronological source. 9011 cannot pass without:

1. Cloudflare zone **`quizcontext.app`** (already registered).
2. DigitalOcean Droplet: Ubuntu LTS, ≥2 GB RAM, SSH key login, public IPv4.
3. Cloudflare **unproxied** (grey-cloud) `A` record `int` → that IPv4, so Caddy can obtain certificates with HTTP-01.
4. Atlas cluster, database **`quizcontext-int`**, dedicated user, IP allowlist = Droplet IPv4 (not `0.0.0.0/0` for normal operation), `MONGODB_URI` stored off git.
5. INT secrets generated and stored in a password manager (see checklist). New `AI_KEY_ENCRYPTION_KEY` for INT; keep it for the life of this database.

Cursor does not create cloud accounts, pay invoices, or click Cloudflare/Atlas/DigitalOcean consoles.

## Planning decisions (locked)

1. **Compute:** DigitalOcean Droplet, Ubuntu LTS, ~2 GB. Not Vercel, App Platform, AWS, or another VPS unless DigitalOcean is unavailable.
2. **Public URL:** `https://int.quizcontext.app`. Apex stays parked. Cloudflare is **DNS only** for D1.
3. **Caddy on the VM, outside Compose.** Reverse-proxy to `127.0.0.1:4017`. Public website ports **80 and 443** only. Caddy manages Let’s Encrypt. This is intentional hands-on hosting practice.
4. **Do not use** Cloudflare Tunnel, Cloudflare Access, email allowlists, invitation-only registration, Caddy basic auth, or any extra gate. Anyone with the URL can register, subject to existing QuizContext auth and ownership.
5. **Do not use** Kubernetes, ECS, DigitalOcean App Platform, or Vercel.
6. **Atlas** is `MONGODB_URI` only. Empty database at first cutover. Local Mongo unchanged. Migration is a D2 activity, not this ticket.
7. **Secrets off git.** Untracked env file on the VM plus a password-manager copy. `INTERNAL_API_KEY` must match in both containers. Changing `AI_KEY_ENCRYPTION_KEY` later orphans encrypted user keys on INT.
8. **Deploy source:** git ref on `dev-deploy` (then `Phase9-historyEnhance` after merge). Not `origin/main`. Record the deployed SHA. Redeploy = newer SHA, same VM, same Atlas. Rolling back **code** does not roll back Mongo.
9. **Same git motion as 9010:** add runbook + Caddyfile on `dev-deploy`; merge into `Phase9-historyEnhance`. Do not retag `first-use-9001`.

## In scope
- `docs/getting-started-hosted.md` — the D1 runbook (write it during **implement**, not during this planning pass). One page-scale guide, no `docs/deploy/` tree.
- Tracked `Caddyfile` at the repo root (or an equivalent snippet **only** if a file cannot work with host Caddy). Proxy `int.quizcontext.app` → `127.0.0.1:4017`. Do not reverse-proxy `server-data`.
- Runbook coverage (commands the operator will run; keep them copyable):
  - Ubuntu packages: Docker Engine + Compose plugin, Caddy as a system service
  - DigitalOcean / `ufw` firewall: 22 restricted, 80/443 open, Express ports not public
  - SSH key-only
  - Place secrets, clone/pull the deploy ref, `docker compose up --build -d`
  - Caddy reload; certificate issuance
  - Health: `GET https://int.quizcontext.app/health` and in-app **Diagnostics**
  - Smoke: register, sign in, one subject/topic path, optional quiz if AI is enabled
  - Confirm `server-data` is not reachable on the Droplet public IP (no published port)
  - Reboot: Compose `restart: unless-stopped` + Caddy systemd come back
  - Redeploy by SHA; rollback of images/git ref only
  - Logs: `docker compose logs`, Caddy journal
  - Atlas IP + URI troubleshooting
  - OpenAI: document **actual** D1 spend control before inviting a classmate (see constraints)
  - Backup: Atlas tier limits + a practical off-Droplet `mongodump` of `quizcontext-int` if study data matters
  - One paragraph: local Mongo migration is **D2**, INT data may already be valuable, do not restore over classmate data
- Joint first cutover: operator follows the runbook; agent may assist via SSH **only if the operator provides access during implement** — default is operator-executed commands from the runbook.

## Out of scope
- Dockerfiles, lockfiles, static/SPA code (9010).
- Production on the apex; CI; AWS; extra environments.
- Cloudflare Access / Tunnel.
- Changing `/auth/register`, JWT, ownership, quiz generation, or evaluation.
- Local→Atlas migration scripts.
- Helmet/WAF/secrets manager/rate-limit product/IaC.

## Expected artefacts
- `docs/getting-started-hosted.md`
- `Caddyfile` (tracked)
- Operator checklist already exists; update it only if implement discovers a wrong port/hostname (should not)

## Implementation sequence
1. Confirm 9010 acceptance on `dev-deploy` (images + loopback 4017).
2. Write `Caddyfile` for `int.quizcontext.app` → `127.0.0.1:4017`.
3. Write `docs/getting-started-hosted.md` covering the bullets above, pointing at the operator checklist for console clicks.
4. Operator: Droplet software + DNS grey-cloud + Atlas allowlist + secrets (checklist).
5. Deploy the chosen git SHA; start Compose; reload Caddy.
6. Verify acceptance checks together.
7. Merge `dev-deploy` into `Phase9-historyEnhance` only when the operator explicitly asks (after 9010 and 9011 artefacts exist). Do not merge as part of 9010.

## Acceptance checks
- [x] Runbook exists at `docs/getting-started-hosted.md` and a tracked Caddyfile matches loopback **4017**. Files are in the working tree (not gitignored) and are not committed yet. Live checks below stay open.
- [ ] `https://int.quizcontext.app` shows QuizContext login/register **without** an extra SSO/Access screen.
- [ ] Register, sign in, Diagnostics (webApp + data API + database ok).
- [ ] Refresh of a client route (e.g. `/profile`) still serves the SPA over HTTPS.
- [ ] From a network that is not the Droplet: `server-data` port **4007** is closed on the public IP; `/health` on 4017 is not publicly open (only 80/443).
- [ ] `INTERNAL_API_KEY` is not in the client bundle. No secrets committed.
- [ ] Deployed git SHA is recorded (runbook says where — for example a file on the VM or a compose label).
- [ ] Reboot test or equivalent: Compose + Caddy recover without a manual `docker compose up`.
- [x] Runbook states how to deploy a newer SHA to the **same** Atlas DB, and that rollback does not undo Mongo.
- [x] OpenAI spend control as actually implemented is written before the classmate is invited (`AI_ENABLED`, user vs application key, 100k-token experiment cap).
- [ ] `.env` / keys / `ket.txt` not committed.

## Verification approach
- Operator (or shared session): browser on a **phone or second network** to `https://int.quizcontext.app`.
- `curl -I https://int.quizcontext.app/health` and `curl -I https://int.quizcontext.app/profile`.
- From the operator laptop: attempt `http://<droplet-ip>:4007/health` and `http://<droplet-ip>:4017/health` — both should fail. `https://int.quizcontext.app/health` should succeed.
- Diagnostics screen in the app.
- Optional quiz generate/evaluate only if AI is intentionally enabled.

## Technical constraints
- Caddy HTTP-01 requires port 80 reachable on the hostname. **Grey-cloud DNS.** Orange-cloud + HTTP-01 will fail; do not “fix” that with Tunnel.
- Hosted `CLIENT_ORIGIN=https://int.quizcontext.app`.
- Compose `DATA_API_BASE_URL` stays on the Docker network (`http://<service>:4007`).
- Application-key monthly cap: Phase 8 `getAiConfig()` uses experiment baseline **100000** tokens, not `AI_APP_MONTHLY_TOKEN_LIMIT` from env. User-provided keys are not limited by that cap. Default `AI_ENABLED=false` until the operator chooses otherwise.
- Atlas free-tier cloud backup is limited; do not document a fake enterprise restore.
- Classmate data on INT is real; D2 migration must not assume INT is disposable.
