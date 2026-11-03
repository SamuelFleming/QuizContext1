# D1 as-built — INT on `int.quizcontext.app`

**Updated:** 30 October 2026  
**Environment:** INT (not production). Apex `quizcontext.app` stays parked.  
**Tickets:** [9010](../../devTickets/phase9/9010-int-deployment-scaffold.md) (Compose/SPA), [9011](../../devTickets/phase9/9011-int-runbook-cutover.md) (runbook/Caddy; live checks still open), [9012](../../devTickets/phase9/9012-d1-deployment-docs.md) (this documentation).  
**How to operate INT now:** [docs/getting-started-hosted.md](../../getting-started-hosted.md).  
**What comes after D1:** [deployment-evolution-plan.md](../deployment-evolution-plan.md).  
**Verbatim SSH/PowerShell I/O:** [getting-started-hosted_1-5.txt](getting-started-hosted_1-5.txt) (do not treat that file as a runbook).

No passwords, connection URIs with embedded secrets, private keys, or `.env` values belong in this file or in git. Write **REDACTED** wherever a secret was used.

---

## 1. What this deployment is

D1 hosts Release-2 so the app is reachable without a laptop staying on. Anyone with the URL can register; there is no Cloudflare Access, Tunnel, or extra password gate.

```text
https://int.quizcontext.app
        │
        ▼
Cloudflare DNS only (grey cloud)
        │
        ▼
DigitalOcean Droplet :80 / :443
        │
        ▼
Caddy (host, not Compose)  →  127.0.0.1:4017
        │
        ▼
server-webApp  (React dist + public API)
        │
        ▼
server-data    (Compose network only, :4007)
        │
        ▼
MongoDB Atlas  quizcontext-int  (started empty)
```

| Choice | Why (brief) |
| --- | --- |
| Two Express processes, browser → `server-webApp` only | Charter dual-API; `server-data` is not an internet API |
| Atlas outside the VM | Host can move later without moving Mongo |
| Caddy on the host, grey-cloud DNS | Hands-on HTTPS; HTTP-01 needs the hostname unproxied |
| No Access / Tunnel / extra gate | A classmate needed the normal register/login URL |
| React `dist` inside `server-webApp` | One public URL for D1 |
| Empty INT database | Local laptop Mongo (`quizcontext`) stays a separate dev DB; migration is D2 |
| Manual git + Compose | Fastest path to a URL; CI is D2 |

---

## 2. Chosen inventory

Proven in the cutover transcript unless marked **confirm**.

| Item | Chosen / observed value |
| --- | --- |
| Public URL | `https://int.quizcontext.app` |
| DNS | Cloudflare zone `quizcontext.app`; `A` `int` → Droplet IPv4; **DNS only / grey cloud** |
| Droplet name | `quizcontext-int-ubuntu-syd1` |
| Droplet public IPv4 | `170.64.151.147` (also on `eth0` in the MOTD) |
| Region / size | Sydney intended; **confirm** exact DO SKU in the dashboard |
| OS | Ubuntu **24.04.5 LTS** (Noble), kernel 6.8.0-142-generic |
| SSH | `root` @ Droplet IPv4; key-only (`passwordauthentication no`) |
| Local private key path | `~/.ssh/quizcontext_do_ed25519` (Windows: `%USERPROFILE%\.ssh\quizcontext_do_ed25519`) |
| DigitalOcean SSH key label | `QuizContet-Sam-Development-PC` (spelling as registered) |
| ufw SSH source | Operator public IPv4 **at cutover** (see transcript). Not a stable identifier; update ufw if the laptop IP changes |
| Cloud firewall | Intended inbound 22 (restricted), 80, 443; no public 4007/4017 — **confirm** live DO rules |
| App checkout | `/opt/quizcontext` |
| Git remote / branch | `https://github.com/SamuelFleming/QuizContext1.git`, **`dev-deploy`** (not `main`) |
| Deployed SHA | `b20e173712b20ac6f8258c3347ea1f1bb7d518d9` written to `/root/quizcontext/deployed-sha` |
| Tag / baseline | `first-use-9001` → `8583124`; `Release-2` unmerged artefact |
| Images | `node:22-bookworm-slim`; Compose names `quizcontext-server-webapp`, `quizcontext-server-data` |
| Published ports | `127.0.0.1:4017→4017` only; `server-data` `4007/tcp` unpublished |
| Caddy | Package **2.11.7**; systemd enabled/active; site file `/etc/caddy/Caddyfile` copied from repo |
| Docker | **29.9.2** (`a82e528`); Compose plugin **v5.6.1** |
| Swap | `/swapfile` 2G, persisted in `/etc/fstab` |
| Atlas cluster / DB | `quizcontext-int` (DB created on first write) |
| Atlas DB user | `quizcontext_int_app`; auth database `admin`; role `readWrite` on `quizcontext-int` only (changed from `atlasAdmin`) |
| Atlas network | Droplet IPv4 on the IP access list; laptop IP not required |
| Hosted AI flags (grep of VM `.env`, values only) | `AI_ENABLED=false`; `CLIENT_ORIGIN=https://int.quizcontext.app` |
| Local Mongo | Laptop `mongodb://127.0.0.1:27017/quizcontext` — unchanged |

---

## 3. Credential ledger (names and locations only)

Store values in the password manager and in `/opt/quizcontext/.env` (`chmod 600`). Compose injects them; do not commit that file.

| Name | Unique to INT? | Form / location |
| --- | --- | --- |
| `MONGODB_URI` | Yes | `mongodb+srv://quizcontext_int_app:<REDACTED>@<ATLAS_HOST>/quizcontext-int?<ATLAS_OPTIONS>` — path **must** be `/quizcontext-int` |
| `INTERNAL_API_KEY` | Yes | New random; **same** in both containers; never in the browser |
| `JWT_SECRET` | Yes | New; local sessions need not match |
| `AI_KEY_ENCRYPTION_KEY` | Yes | 32-byte Base64; **keep for the life of this INT database** |
| `OPENAI_API_KEY` | Optional | Omit while `AI_ENABLED=false` |
| `AI_ENABLED` | Hosted value | `false` at cutover |
| `CLIENT_ORIGIN` | Yes | `https://int.quizcontext.app` |
| `DATA_API_BASE_URL` | Compose | `http://server-data:4007` (do not put this in `.env`; Compose sets it) |
| `PORT` | No | 4017 / 4007 via Compose, not `.env` |
| `VITE_WEB_API_BASE_URL` | Build-time | Hosted image baked empty / same-origin; must not be `http://localhost:4017` |
| SSH private key | Local only | Path above; never upload |

`@admin` on the Atlas user is the **authentication database**, not an admin role.

Application-key monthly cap, if you later enable the app key, is **100000** tokens/user/month from `server-webApp/src/constants/aiExperiment/baseline.js`. The `.env.example` name `AI_APP_MONTHLY_TOKEN_LIMIT` is unused while that wiring is present. User-supplied keys are not limited by that cap.

---

## 4. How D1 was set up (critical path)

### 4.1 Outside the IDE (operator)

1. Register `quizcontext.app` on Cloudflare. Confirm the zone spelling.
2. DigitalOcean account, project, SSH public key, Droplet (`quizcontext-int-ubuntu-syd1`, Ubuntu 24.04, ~2 GB, Sydney).
3. Grey-cloud `A` record `int` → Droplet IPv4. `nslookup int.quizcontext.app` must match.
4. Atlas project/cluster `quizcontext-int`, user `quizcontext_int_app` with `readWrite` on that database, IP allowlist = Droplet only.
5. Generate INT secrets into the password manager (`INTERNAL_API_KEY`, `JWT_SECRET`, `AI_KEY_ENCRYPTION_KEY`). Build `MONGODB_URI` with `/quizcontext-int` before `?`.

### 4.2 Repository (9010 / 9011)

On `dev-deploy` (do not recut the branch; do not move `first-use-9001`):

- Dockerfiles, `docker-compose.yml`, lockfiles, static SPA + fallback, Atlas-friendly Mongo timeout, same-origin client base URL.
- Root `Caddyfile` (`int.quizcontext.app` → `127.0.0.1:4017`) and `docs/getting-started-hosted.md`.
- Push before the Droplet clone. First deployed SHA: `b20e173712b20ac6f8258c3347ea1f1bb7d518d9`.

### 4.3 SSH cutover (as actually run)

Windows PowerShell → Droplet. Exact I/O is in [getting-started-hosted_1-5.txt](getting-started-hosted_1-5.txt). Representative commands (secrets omitted):

```text
ssh -o IdentitiesOnly=yes -i "$env:USERPROFILE\.ssh\quizcontext_do_ed25519" root@<DROPLET_PUBLIC_IPV4>
```

On the Droplet, in order:

1. Confirm Ubuntu 24.04.5 and `passwordauthentication no`.
2. `ufw`: default deny incoming, allow outgoing, SSH from the **then-current** operator IPv4, allow 80/443, `ufw enable`. No 4007/4017.
3. `apt upgrade`; reboot (SSH dropped; reconnect). Swap 2G at `/swapfile`.
4. Docker Engine from Docker’s Ubuntu apt repo; Compose plugin; `hello-world` succeeded. Versions: Docker 29.9.2, Compose v5.6.1.
5. Caddy 2.11.7 from Cloudsmith; `systemctl enable --now caddy`.
6. **Git was not installed** on the image. First `git clone` printed `git: command not found`. The successful clone followed; the `apt install git` line is **not** in the `1-5` transcript — install `git` before clone if repeating.
7. Clone:

```bash
git clone --branch dev-deploy --single-branch https://github.com/SamuelFleming/QuizContext1.git /opt/quizcontext
cd /opt/quizcontext
git rev-parse HEAD | tee /root/quizcontext/deployed-sha
```

8. `cp .env.example .env && chmod 600 .env` then fill secrets in `nano` (**REDACTED**). Confirm `.env` does **not** set `PORT`, `DATA_API_BASE_URL`, or `VITE_WEB_API_BASE_URL`.
9. `docker compose up --build -d`. First `curl http://127.0.0.1:4017/health` reset (webApp still starting); after ~15s, healthy and `{"data":{"service":"server-webApp","status":"ok"}}`. `server-data` had no published host port.
10. `cp /opt/quizcontext/Caddyfile /etc/caddy/Caddyfile`; `caddy validate`; `systemctl reload caddy` (enabled/active).

The `1-5` log **stops there**. It does not prove laptop HTTPS, the Diagnostics screen, a probe of public `:4007`/`:4017`, or a reboot **after** Compose.

---

## 5. Checks the `1-5` log does not prove

Record as done only after you have evidence. Do not invent a pass.

| Check | Status here |
| --- | --- |
| `https://int.quizcontext.app/health` from a laptop | Confirm if done |
| Register / sign in / Diagnostics (webApp + data API + database) | Confirm if done |
| SPA refresh (`/profile`, `/subjects/...`) over HTTPS | Confirm if done |
| Public Droplet `:4007` and `:4017` closed from off-box | Confirm if done |
| Reboot with Compose + Caddy returning unaided | Pre-Compose reboot is in the log; **post-Compose reboot is not** |
| Classmate invited | Confirm if done |
| Off-Droplet `mongodump` of `quizcontext-int` | Not part of D1 cutover |

Redeploy, rollback, logs, and dump commands stay in [docs/getting-started-hosted.md](../../getting-started-hosted.md).

---

## 6. Related files

| File | Role |
| --- | --- |
| [docs/getting-started-hosted.md](../../getting-started-hosted.md) | Living how-to for the current host |
| [deployment-evolution-plan.md](../deployment-evolution-plan.md) | D1–D6 direction |
| [getting-started-hosted_1-5.txt](getting-started-hosted_1-5.txt) | Verbatim cutover token |
| Root `Caddyfile`, `docker-compose.yml`, `.env.example` | Tracked host artefacts |
