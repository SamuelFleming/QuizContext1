# QuizContext — D1 infrastructure handoff and deployment record

**As-of:** 29 October 2026  
**Status:** External infrastructure substantially provisioned; **9010 scaffold is on `dev-deploy`**; **9011 runbook and Caddyfile are written** (not yet committed); application **not yet deployed** to the Droplet.  
**Purpose:** Transfer the verified setup state into Cursor for tickets 9010/9011, and maintain a factual record of D1 deployment as it happens.  
**Handling:** This document is safe to store in the repository **only while it contains no passwords, connection URIs, private SSH keys, API keys, session tokens or other credentials**. Record credential *names and password-manager references*, never secret values.

## 1. Locked D1 target

```text
Public browser → https://int.quizcontext.app
               → Cloudflare DNS ONLY (grey cloud)
               → DigitalOcean Ubuntu Droplet, TCP 443/80
               → Caddy HTTPS/reverse proxy
               → 127.0.0.1:4017 → server-webApp (Express + built React SPA)
                                    → server-data (private Docker network, port 4007)
                                         → MongoDB Atlas (database: quizcontext-int)
```

- One publicly accessible **INT** environment, not production; normal QuizContext registration/login, **no additional Cloudflare Access gate**, whitelist or Tunnel.
- Two application containers (`server-webApp`, `server-data`), no MongoDB container. `server-data` has **no host-published port**. The Web API stays public through Caddy; the data API stays internal.
- Keep Release-2 feature behaviour and existing backend boundaries unchanged. Do not restructure quiz/AI logic or introduce new APIs for D1.
- D1 deployment is **manual, repeatable Git + Docker Compose**, with Caddy managed on the VM. CI/CD, AWS and component separation belong to later milestones.
- The hosted Atlas database starts empty. The laptop's local MongoDB remains unchanged. Deliberate local-to-Atlas migration is a separately gated D2 activity; do not overwrite study data created on INT.

## 2. Platform inventory — reported completed

| Area | Reported state as of 29 Oct 2026 | Evidence / follow-up |
|---|---|---|
| Cloudflare registrar / DNS zone | `quizcontext.app` registered and **Active**; initially no DNS records | Confirmed by owner in chat |
| Cloudflare INT DNS | A record: `int.quizcontext.app` → DigitalOcean Droplet public IPv4; **DNS only / grey cloud** | Owner tested `nslookup int.quizcontext.app` and confirmed it resolves to Droplet IP. Record actual IP in *private* operator inventory if useful. |
| DigitalOcean account | Created; billing/address issue resolved | Owner confirmed |
| DigitalOcean project | QuizContext project created during setup | Verify exact project display name in dashboard |
| DigitalOcean Droplet | Active; SSH prompt identifies `quizcontext-int-ubuntu-syd1`; public IPv4 allocated | Owner connected from Windows PowerShell over SSH |
| Droplet OS | **Ubuntu 24.04.5 LTS** | Confirmed by `/etc/os-release` output |
| Droplet plan / region | Intended: Sydney, Basic/Regular, ~2 GB RAM / 1 vCPU | Verify exact paid SKU and region in dashboard; don't infer from hostname alone |
| SSH key registered in DigitalOcean | Display name reported as `QuizContet-Sam-Development-PC` (retain exact spelling until verified) | Windows private key stays local; public key uploaded. SSH root login succeeded. |
| DigitalOcean Cloud Firewall | Firewall creation/configuration performed; SSH from laptop succeeds | **Verify** firewall is attached, inbound SSH source is owner's public IPv4 `/32`, inbound 80/443 open, and **no** public 4007/4017. Don't infer all rule details solely from successful SSH. |
| Atlas deployment | Cluster named `quizcontext-int` created | Owner confirmed in connection wizard; verify project name, M0 tier and region in dashboard |
| Atlas database | Intended DB `quizcontext-int`; **may not yet appear until first write** | Existing `server-data` selects its database through `MONGODB_URI` path |
| Atlas network access | Owner chose **Add a different IP address** and entered Droplet public IPv4 | Verify list contains the Droplet IP only (no accidental `0.0.0.0/0` or unnecessary current-IP entry) |
| Atlas DB user | `quizcontext_int_app` (auth database `admin`) created | Owner changed from initial `atlasAdmin` to database-limited `readWrite` on `quizcontext-int`; verify no additional broad roles remain. `@admin` is authentication database, not proof of admin role. |
| Atlas connection method | JavaScript → Node.js driver; SRV URI | Correct for existing Mongoose integration |
| Credentials | Atlas DB password stored in owner's password manager | **Confirm** final `MONGODB_URI` has been stored there; do not print or commit it. |

## 3. Verified application facts from Cursor's read-only inspection

- `server-data/src/index.js` calls `connectDatabase(process.env.MONGODB_URI)`.
- `server-data/src/config/db.js` calls `mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 })` with **no separate `dbName` override**.
- Current dependency reported: Mongoose `9.11.1`, MongoDB driver `~7.7`, compatible with `mongodb+srv://`.
- INT URI must include **`/quizcontext-int` before any `?` options**, e.g. `mongodb+srv://<user>:<encoded-password>@<atlas-host>/quizcontext-int?<atlas-options>`.
- Existing local URI/database stays `mongodb://127.0.0.1:27017/quizcontext`.
- 9010 plans a longer MongoDB server-selection timeout for Atlas; no DB-name-specific code change required.
- Existing `/health` and Diagnostics endpoints are to be reused.
- **Hosted frontend build issue:** `VITE_WEB_API_BASE_URL || "http://localhost:4017"` treats empty string as falsy. 9010 must ensure the built browser client calls the hosted same-origin Web API, not the visitor's localhost.
- **AI configuration caveat:** Cursor reported `AI_APP_MONTHLY_TOKEN_LIMIT` in `.env.example` is not the active Phase 8 cap. Its reported baseline is **100000 application-key tokens/user/month**; user-provided keys are not constrained by that specific cap. Verify real AI enablement/key selection logic and cost protections before inviting testers.

## 4. Git/release facts to preserve

- Branch for D1 implementation: `dev-deploy`; **do not recreate** it.
- Existing tag: `first-use-9001` → `8583124`; **do not move/retag**.
- `Release-2` is the first-use baseline and remains an unmerged artefact.
- `Phase9-historyEnhance` already has 9002–9008 code (ticket-status documentation may lag). Merge scaffold there after implementation as planned.
- `main` is **not** presently the D1 deployment source.
- Context source discrepancy: the planning agent reported `ChatDeploymentPlanning.md` **was not present**; it used `chat-2.md`, 9010/9011 and repository inspection. Do not silently assume the named planning file exists.

## 5. Environment-variable contract and secret ledger

**These are names/roles, not real values.** Put secret values in the password manager and, when the 9011 runbook instructs, in a **VM-local untracked, access-restricted configuration file**. Ensure Docker Compose actually injects the values into the correct services (`env_file` / `environment`), not just reads `.env` for Compose interpolation.

| Variable | Consumer / stage | Planned INT source or form | Action / caution |
|---|---|---|---|
| `MONGODB_URI` | `server-data` runtime | Password-manager entry → VM-only secret env | Atlas SRV, database path `/quizcontext-int`, encoded password if necessary; **never** client-side |
| `INTERNAL_API_KEY` | Both backend services, runtime | New strong random INT value, **identical** for both | Password manager → VM env; never in React dist |
| `JWT_SECRET` | `server-webApp` runtime | New high-entropy INT value | Separate from local development |
| `AI_KEY_ENCRYPTION_KEY` | `server-webApp` runtime | New **32-byte base64** INT value | Preserve securely for lifespan of INT user-encrypted keys; replacing it breaks decryption of existing user keys |
| `OPENAI_API_KEY` | `server-webApp` runtime, conditional | Optional app-owned key | Do not supply/enable until usage policy decided; no secret in repository |
| `AI_ENABLED` | `server-webApp` runtime | Start with `false` **unless** verified behaviour requires adjustment to meet tester needs | Verify whether user-supplied keys and AI features work with this setting; document chosen behaviour and spend controls |
| `CLIENT_ORIGIN` | `server-webApp` runtime | `https://int.quizcontext.app` | Public browser origin |
| `DATA_API_BASE_URL` | `server-webApp` runtime | Internal Compose service URL, e.g. `http://server-data:4007` | No public address or host port for Data API |
| `PORT` | Both backends, runtime | `4017` for Web API; `4007` for Data API | Different value per service |
| `VITE_WEB_API_BASE_URL` | React **build time** | Same-origin approach if supported | Fix localhost fallback; only public, non-secret build values in client |
| Existing AI timeouts/limits | `server-webApp`, runtime | Existing application contract | Verify exact names from repository; no new product env names in D1 |

**Private credential inventory (store in password manager; reference only):** Atlas DB user/password and complete INT `MONGODB_URI`; INT `INTERNAL_API_KEY`; `JWT_SECRET`; `AI_KEY_ENCRYPTION_KEY`; optional `OPENAI_API_KEY`; local SSH private-key path and passphrase reference; GitHub deploy credentials if later used. Never copy their values into this document, Cursor prompts or Git.

## 6. What remains before first live deployment

| Order | Owner | Activity / acceptance evidence | Related ticket |
|---|---|---|---|
| 1 | Owner | Verify Atlas `quizcontext_int_app` has only `readWrite` on `quizcontext-int`; IP access list limited to Droplet; save final SRV URI (with DB path) in password manager | External prerequisite |
| 2 | Owner | Generate/store INT `INTERNAL_API_KEY`, `JWT_SECRET`, `AI_KEY_ENCRYPTION_KEY`; decide and verify INT AI policy; record passwords **only** in manager | External prerequisite |
| 3 | Cursor | **9010 Done** on `dev-deploy`: two Dockerfiles, Compose, lockfiles, hosted static/SPA, client API-base fix, Atlas `mongodb+srv` timeout. Local `npm start` unchanged. Compose `build`/`up` unrun on the implement PC (no Docker Desktop). | 9010 |
| 4 | Cursor | **9011 artefacts written** on `dev-deploy`: root `Caddyfile` (`int.quizcontext.app` → `127.0.0.1:4017`) and `docs/getting-started-hosted.md`. Live cutover is rows 5–10. Files are in the working tree until committed and pushed; a Droplet clone cannot see them before that. | 9011 |
| 5 | Owner | SSH to VM; follow **9011 runbook** to install Docker Engine/Compose and Caddy; configure services to survive reboot | 9011 |
| 6 | Owner | Clone/pull exact approved Git ref (currently `dev-deploy`), record SHA; create VM-only environment configuration from templates; **restrict file permissions** (e.g. `chmod 600`) | 9011 |
| 7 | Owner | `docker compose up --build -d` per runbook; confirm `/health` locally via `127.0.0.1:4017` and internal API/database connectivity | 9010/9011 |
| 8 | Owner | Install/reload tracked Caddyfile; Caddy obtains TLS for DNS-only `int.quizcontext.app`; confirm HTTPS `/health` externally | 9011 |
| 9 | Joint | Smoke test registration/login, Diagnostics all green, SPA refresh, quiz flow, endpoint auth, no frontend secrets, no publicly reachable 4017/4007 | D1 acceptance |
| 10 | Owner | Reboot test, verify logs/redeploy/rollback approach and database backup plan, then invite classmate | D1 acceptance |
| 11 | Owner + later ticket | First off-VM database backup after real INT data exists; plan and approve any local→Atlas merge/migration separately; preserve classmate's data | D2 migration |

9010 artefacts are on `dev-deploy`. 9011’s Caddyfile and runbook are written in the working tree and still need a commit plus push before the Droplet can clone them. Compose images have not been built on this PC or the Droplet.

## 7. Deployment evidence log — fill out as D1 happens

| Date (AEST) | Stage / platform | Action performed | Non-secret configuration / version | Evidence or result | Git SHA / ticket |
|---|---|---|---|---|---|
| 2026-10-29 | DigitalOcean | Verified SSH login, Ubuntu version | Ubuntu 24.04.5 LTS; Droplet `quizcontext-int-ubuntu-syd1` | `/etc/os-release` shown in chat | External prep |
| 2026-10-29 | Cloudflare | Added INT A record, DNS only | `int.quizcontext.app` → Droplet IPv4 | `nslookup` resolves correctly | External prep |
| 2026-10-29 | Atlas | Created cluster, DB user and Droplet IP access rule | Cluster `quizcontext-int`; DB target `quizcontext-int`; DB user `quizcontext_int_app` | Atlas connection wizard; user-reported role edit | External prep |
| 2026-10-29 | Repo / 9010 | Hosted compose scaffold on `dev-deploy` | Node 22 bookworm-slim images; loopback `127.0.0.1:4017`; `DATA_API_BASE_URL=http://server-data:4007`; SPA HTML Accept gate; Atlas timeout 30s for `mongodb+srv` only | Local health/Diagnostics ok; Vite 5017 ok; SPA proven on temporary port 14017; same-origin bundle has empty API base and no `INTERNAL_API_KEY`. `docker compose build` unrun (no Docker Desktop) | 9010 |
| 2026-10-29 | Repo / 9011 | Wrote hosted runbook and Caddyfile | Caddy site `int.quizcontext.app` → `127.0.0.1:4017` only; runbook covers Docker, Caddy, ufw, `.env`, SHA file `/root/quizcontext/deployed-sha`, redeploy/rollback, Atlas, 100000-token application cap, off-Droplet `mongodump` | Files in the `dev-deploy` working tree. Not committed. Application not deployed. Live checks open. | 9011 |

For future portfolio/postmortem documentation, record **why** each design decision was made, the exact commands executed (with secrets redacted), version identifiers, problems encountered, diagnostics and resolutions. Avoid claiming completed deployment or CI/CD before verified.

## 8. Facts still to confirm (not necessarily blockers)

- Exact DigitalOcean project name, Droplet size and billing SKU, public IP (keep the IP in your private operator inventory if preferred), and firewall's final rule sources.
- Atlas project, tier, provider/region, final role list and network access list. Whether the DB URI was stored with `/quizcontext-int`.
- AI policy verified in code: `AI_ENABLED=false` blocks **application** key only. Profile mode **My own OpenAI key** still generates/evaluates. Default access mode is application, so testers must switch mode. Keep INT `AI_ENABLED=false` and omit `OPENAI_API_KEY`.
- Whether the chosen Atlas tier automates backups. The runbook documents an off-Droplet `mongodump` and says to record what the Atlas UI actually offers. That UI check is still the owner’s.
- Which GitHub clone the VM will use. The runbook tries HTTPS `dev-deploy`, then a read-only deploy key if GitHub asks for credentials. Keep the private key off git.

**Authoritative supporting files in repository:** `docs/reference/Deployment/deployment-operator-checklist.md`; `docs/reference/Deployment/deployment-evolution-plan.md`; `docs/devTickets/phase9/9010-int-deployment-scaffold.md`; `docs/devTickets/phase9/9011-int-runbook-cutover.md`; `docs/getting-started-hosted.md`; root `Caddyfile`.
