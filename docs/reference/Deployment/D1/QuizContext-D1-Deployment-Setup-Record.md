# QuizContext — D1 Deployment Setup Record

**Updated:** 29 October 2026  
**Goal:** Host existing Release-2 app at `https://int.quizcontext.app`; no extra access gate, no local-data migration in D1.

## 1. Infrastructure configured

| Component | Confirmed setup | Status |
|---|---|---|
| Domain / DNS | `quizcontext.app` active in Cloudflare; DNS-only (grey-cloud) `A` record `int` → Droplet public IPv4; `nslookup int.quizcontext.app` resolves correctly | Complete |
| Cloud host | DigitalOcean project for QuizContext; Droplet `quizcontext-int-ubuntu-syd1` in Sydney | Running |
| OS / access | Ubuntu **24.04.5 LTS**; SSH login as `root` from Windows PowerShell verified | Complete |
| SSH credential | DigitalOcean public-key entry **`QuizContet-Sam-Development-PC`** (name as provided); matching **private key stays on laptop** | Added / tested |
| Firewall | Cloud firewall created for Droplet; intended inbound **22** (restricted to laptop public IP), **80/443** (public); no public **4017/4007** | Verify exact live rules |
| Atlas | Cluster/deployment `quizcontext-int`; intended database `quizcontext-int` (created on first write) | Provisioned; DB initially empty |
| Atlas network | Droplet public IPv4 added to Atlas IP access list; laptop IP not required | Configured |
| Atlas DB user | `quizcontext_int_app` (auth database `admin`); changed from `atlasAdmin` to **`readWrite` on `quizcontext-int` only** | Updated |
| Local database | Laptop MongoDB database `quizcontext` remains separate; migration deferred to D2 | Unchanged |

**Not recorded here:** public IP addresses, database hostnames, passwords, private keys or API secrets. Keep these in the password manager; insert them only into the host's untracked environment file when deploying.

## 2. Credential / configuration reference (no secret values)

| Item | Value or location |
|---|---|
| Site hostname | `int.quizcontext.app` |
| Droplet SSH login | `root@<DROPLET_PUBLIC_IPV4>` |
| Local SSH private key | Expected: `~/.ssh/quizcontext_do_ed25519` (verify actual filename); **never upload** |
| Atlas DB user | `quizcontext_int_app` |
| Atlas auth database | `admin` (the `@admin` in Atlas UI is **not** an admin privilege) |
| Hosted database | `quizcontext-int` |
| `MONGODB_URI` | `mongodb+srv://quizcontext_int_app:<URL_ENCODED_PASSWORD>@<ATLAS_HOST>/quizcontext-int?<ATLAS_OPTIONS>` — preserve Atlas query parameters |
| `INTERNAL_API_KEY` | New INT-only secret; **same value in both API containers** |
| `JWT_SECRET` | New INT-only signing secret |
| `AI_KEY_ENCRYPTION_KEY` | New INT-only **32-byte Base64** secret; retain for decrypting stored user keys |
| `OPENAI_API_KEY` / `AI_ENABLED` | Optional app-key mode; decide before inviting testers; audit AI spend limits |
| `CLIENT_ORIGIN` | `https://int.quizcontext.app` |
| `DATA_API_BASE_URL` | `http://server-data:4007` inside Compose |
| `PORT` | Web API `4017`; Data API `4007` |
| `VITE_WEB_API_BASE_URL` | Hosted build: empty/same-origin; **must not resolve to localhost** |

**Security:** Passwords, connection URI with embedded password, SSH private key and generated secret *values* must never be committed to Git or pasted into planning prompts.

## 3. Application and deployment state

- **9010 implemented locally on `dev-deploy`**, but as last reported **not committed/pushed**; Dockerfiles, `docker-compose.yml`, root `.env.example`, static React serving and hosted Atlas timeout handling created.
- Compose design: Caddy (host-level, planned) → `127.0.0.1:4017` → `server-webApp` → private `server-data:4007` → Atlas. Only webApp port is published to **loopback**.
- Local `npm start`, MongoDB and ports `5017` / `4017` / `4007` stay unchanged.
- **9011 not started** at last update: tracked `Caddyfile` and `docs/getting-started-hosted.md` still pending.
- Docker Compose build/run **not verified**. Windows Docker Desktop installation blocked by disabled **Virtual Machine Platform**; it is optional to fix locally. Docker Engine + Compose must be installed and tested on the Droplet.
- Git tag `first-use-9001` remains at `8583124`; `main` is **not** the initial deployment source.

## 4. Remaining steps (in order)

1. Have Cursor implement **9011**: Caddy configuration and exact Ubuntu/Compose deployment runbook; reconcile outstanding 9010 verification.
2. Review, **commit and push `dev-deploy`**; ensure no `.env`, credentials or `ket.txt` are staged.
3. Generate/store INT secrets securely (if not already done); verify Atlas URI includes **`/quizcontext-int`**.
4. SSH to Droplet; follow **9011 runbook** to install Docker Engine/Compose and Caddy, pull the intended Git SHA, create root **untracked `.env`** from `.env.example` with restricted permissions, and build/start containers.
5. Test `https://int.quizcontext.app/health`, login/registration, Diagnostics (webApp + data API + DB), SPA refresh, backend port isolation, and reboot recovery.
6. Back up Atlas data once real study use starts; later plan a controlled **local → Atlas migration** without overwriting classmate data.

**Record actual deployment SHA, dates, issues and final settings in this file after cutover.**
