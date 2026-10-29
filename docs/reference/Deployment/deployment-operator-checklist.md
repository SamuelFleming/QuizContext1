# D1 operator checklist (outside Cursor)

Tasks **you** perform in Cloudflare, DigitalOcean, MongoDB Atlas, and on the Droplet over SSH. Cursor implements repository artefacts on [9010](../../devTickets/phase9/9010-int-deployment-scaffold.md) and [9011](../../devTickets/phase9/9011-int-runbook-cutover.md). The copy-paste Linux commands for Docker/Caddy live in `docs/getting-started-hosted.md` **after 9011 is implemented** — do not invent a second runbook here.

**Locked D1 facts (from the repo, not from chat):**

| Item | Value |
| --- | --- |
| Public URL | `https://int.quizcontext.app` |
| Apex | `quizcontext.app` (parked; not production) |
| DNS | Cloudflare, **grey-cloud / DNS only** so Caddy can issue certificates |
| WebApp loopback | `127.0.0.1:4017` (existing `PORT`) |
| Data API | `4007` inside Compose only; never public |
| Health | `GET /health` on each Express app |
| Diagnostics | in-app screen; webApp `GET /diagnostics/connectivity` |
| Compose services | `server-webApp`, `server-data` only |
| Do **not** configure | Cloudflare Access, Tunnel, orange-cloud proxy, extra login gates |

**Owners**

| Owner | Means |
| --- | --- |
| You | Accounts, billing, DNS clicks, Atlas, SSH, secrets storage, inviting a classmate |
| Cursor | Dockerfiles, Compose, static/SPA, Caddyfile, `docs/getting-started-hosted.md` |
| Joint | HTTPS smoke, Diagnostics, “data API is dark”, classmate can log in |

When a step depends on Cursor artefacts, skip it until that ticket is done.

## A. Can start immediately (no 9010 artefacts)

| Step | Action | Owner | Depends on | Related ticket | Completion evidence |
| --- | --- | --- | --- | --- | --- |
| A1 | Confirm the Cloudflare zone is exactly `quizcontext.app` (not a misspelling). | You | Domain purchase | — | Zone name in Cloudflare dashboard |
| A2 | Create a DigitalOcean account, add a payment method, and generate an SSH key pair. Upload the **public** key to DigitalOcean. Keep the private key off git and off chat logs. | You | — | 9011 | Key listed on the DO account |
| A3 | Create a MongoDB Atlas account and a project for QuizContext INT (cluster can be M0 / free tier). Do not allow `0.0.0.0/0` as the long-term rule. | You | — | 9011 | Atlas project exists |
| A4 | Generate INT-only secrets in a password manager (placeholders only in git): `INTERNAL_API_KEY` (long random; **same** value for both containers), `JWT_SECRET` (new; local sessions need not match), `AI_KEY_ENCRYPTION_KEY` (32 bytes base64: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`). **Keep this encryption key for the life of `quizcontext-int`.** Do not reuse or lose it if you want INT user API keys to keep working or to migrate later. | You | Node on your laptop | 9011 | Values stored in the password manager, not in the repo |
| A5 | Decide AI for INT: leave `AI_ENABLED=false` until you are ready to spend. If you enable the **application** key, the live cap is **100000 tokens/user/month** from the Phase 8 experiment baseline (`server-webApp/src/constants/aiExperiment/baseline.js`), not the unused-looking `AI_APP_MONTHLY_TOKEN_LIMIT` env example. User-supplied keys are not limited by that cap. Prefer testers using **their own key** on Profile if you want to avoid shared spend. | You | A4 | 9011 | Written decision: off / app key / user keys |
| A6 | Optional: create the Droplet now — Ubuntu LTS, **2 GB RAM / 1 vCPU**, region near you (Sydney `syd1` is the natural pick from UTC+10), SSH key from A2. Note the **public IPv4**. Enable basic Droplet graphs. Do **not** open 4007/4017 on the public network. | You | A2 | 9011 | IPv4 written next to the Droplet |
| A7 | If the Droplet exists: DigitalOcean cloud firewall inbound **22** (your IP if possible), **80**, **443**; outbound all (Atlas, Let’s Encrypt, Docker Hub). | You | A6 | 9011 | Firewall attached; 4017/4007 not inbound |

## B. After the Droplet has an IPv4 (still before or during 9010)

| Step | Action | Owner | Depends on | Related ticket | Completion evidence |
| --- | --- | --- | --- | --- | --- |
| B1 | Cloudflare DNS: `A` name `int`, content = Droplet IPv4, **proxy status DNS only (grey cloud)**. TTL can be auto. | You | A1, A6 | 9011 | `nslookup int.quizcontext.app` returns the Droplet IP |
| B2 | Atlas: database name **`quizcontext-int`**, dedicated user with `readWrite` on that DB only, network access = **Droplet IPv4 only** for normal use. Copy the SRV connection string into the password manager as `MONGODB_URI` (database name `quizcontext-int` in the path). | You | A3, A6 | 9011 | URI stored off git; allowlist is the Droplet IP |
| B3 | Turn on whatever Atlas backup your tier actually offers. If it is free-tier with no real PITR, plan an off-Droplet `mongodump` once INT has study data (runbook will say how). | You | B2 | 9011 | Backup setting noted |

## C. Wait for Cursor (9010, then 9011 runbook)

| Step | Action | Owner | Depends on | Related ticket | Completion evidence |
| --- | --- | --- | --- | --- | --- |
| C1 | 9010 artefacts on `dev-deploy`: `docker-compose.yml`, Dockerfiles, lockfiles, static/SPA. You do not need to write these. Compose `build`/`up` was not run on the implement Windows PC (no Docker Desktop); prove it on the Droplet in 9011 or after installing Docker locally. | Cursor | — | 9010 | Dockerfiles + Compose present on `dev-deploy`; ticket 9010 Done with Compose checks still unrun |
| C2 | 9011 writes `docs/getting-started-hosted.md` and a tracked `Caddyfile`. Stop using this checklist as a substitute for those commands. | Cursor | C1 | 9011 | Those files exist on `dev-deploy` |
| C3 | SSH to the Droplet (`ssh -i <private-key> root@<ipv4>` or the user the image created). | You | A6 | 9011 | Interactive shell |
| C4 | Follow the runbook: install Docker Engine + Compose plugin, install Caddy, enable both to start on boot. | You | C2, C3 | 9011 | `docker compose version`; `caddy version`; Caddy systemd enabled |
| C5 | Clone or pull the **deploy git ref** (`dev-deploy` until `Phase9-historyEnhance` is the agreed source). Not `main`. Record `git rev-parse HEAD`. | You | C3, GitHub access on the VM (deploy key or HTTPS) | 9011 | SHA written down (password manager or a root-only file) |
| C6 | Create the untracked Compose env file on the VM from `.env.example` (`chmod 600`). Fill A4 + B2 values. `CLIENT_ORIGIN=https://int.quizcontext.app`. Do **not** set `PORT` or `DATA_API_BASE_URL` — Compose injects `4017`/`4007` and `http://server-data:4007`. Do not commit this file. Keep a copy in the password manager. | You | C2, A4, B2 | 9011 | Compose starts without missing-env errors |
| C7 | Runbook: `docker compose up --build -d`. Confirm `server-webApp` is published only on loopback 4017 and `server-data` is not published. | You | C1, C6 | 9010+9011 | `curl http://127.0.0.1:4017/health` on the VM succeeds |
| C8 | Install the tracked Caddyfile; reload Caddy. Confirm certificate for `int.quizcontext.app`. | You | B1, C4, C7 | 9011 | `https://int.quizcontext.app/health` from your laptop |

## D. Joint verification (after C8)

| Step | Action | Owner | Depends on | Related ticket | Completion evidence |
| --- | --- | --- | --- | --- | --- |
| D1 | Browser: login/register page, **no** Cloudflare Access screen. Register a user. Sign in. | Joint | C8 | 9011 | Session works |
| D2 | Open **Diagnostics**: webApp, data API, and database all ok. | Joint | D1, B2 | 9011 | Three ok statuses |
| D3 | Refresh `/profile` (or `/subjects/...`) — SPA, not a JSON 404. | Joint | 9010 SPA + C8 | 9010+9011 | Page reloads |
| D4 | From your laptop (not the VM): `http://<droplet-ip>:4007/health` and `http://<droplet-ip>:4017/health` fail. HTTPS on the hostname works. | Joint | A7, C7 | 9011 | Public Express ports closed |
| D5 | Confirm `INTERNAL_API_KEY` is not in the served JS (search the Network tab / bundle). | Joint | C7 | 9010 | Key absent |
| D6 | Phone or a second network: open `https://int.quizcontext.app`, sign in. | You | D1 | 9011 | Works off home LAN |
| D7 | If AI is enabled: one connectivity test on Profile; watch usage. If not enabled: skip quizzes that need OpenAI. | You | A5 | 9011 | No surprise bill, or a known small test |
| D8 | Reboot the Droplet once; confirm the site returns without a manual compose up. | You | C7, C8 | 9011 | Site up after reboot |
| D9 | Invite the classmate: send only the URL. They register themselves. Remind them INT is not production and to keep a copy of anything they cannot afford to lose until backups (B3) are real. | You | D1–D6, A5 | 9011 | They can log in |
| D10 | After INT holds study data: first off-Droplet `mongodump` (runbook). Local laptop Mongo is **not** this dump. | You | D9 | 9011 / D2 | Dump stored off the VM |

## E. Later (not D1, listed so you do not do them now)

| Step | Action | Owner | Notes |
| --- | --- | --- | --- |
| E1 | Local Mongo → Atlas migration | You + later ticket | D2 activity. Do **not** restore over classmate data. See [deployment-evolution-plan.md](deployment-evolution-plan.md). |
| E2 | CI/CD, GitHub Actions, AWS, extra APIs | — | D2–D6. Not this checklist. |
| E3 | Orange-cloud / Access / Tunnel | — | Explicitly out of D1. Would break Caddy HTTP-01 as specified. |

## Secrets cheat sheet (no values)

| Name | Unique to INT? | Notes |
| --- | --- | --- |
| `MONGODB_URI` | Yes | Atlas `quizcontext-int` |
| `INTERNAL_API_KEY` | Yes | Identical in both containers; never in the browser |
| `JWT_SECRET` | Yes | New for INT |
| `AI_KEY_ENCRYPTION_KEY` | Yes for D1 | 32-byte base64; **retain forever** for this DB |
| `OPENAI_API_KEY` | Optional | Only if `AI_ENABLED=true` with application mode |
| `AI_ENABLED` | Hosted value | Default `false` |
| `CLIENT_ORIGIN` | Yes | `https://int.quizcontext.app` |
| `DATA_API_BASE_URL` | Compose value | Service name + `4007`, not public hostname |
| `VITE_WEB_API_BASE_URL` | Build-time | Must not bake `localhost:4017` into the INT image (9010) |
| `PORT` | No | Keep 4017 / 4007 |
