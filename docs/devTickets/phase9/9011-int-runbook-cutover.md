# 9011 — INT runbook and first cutover

**Status:** Planned  
**Phase:** 9 (ops, parallel to 9002–9008)  
**Depends on:** [9010](9010-int-deployment-scaffold.md) compose scaffold on `dev-deploy`; human preconditions below.  
**Relevant scope:** First non-prod host; charter dual-API boundary

## Objective
Put Release-2 on a long-lived INT URL that testers can open from any device, with HTTPS and a private gate in front of the existing login. Do not invent a production environment.

## Planning decisions (locked)

1. **Compute is a Linux VPS, not Vercel.** Vercel, Cloudflare Pages, and similar PaaS hosts do not run the two Express processes and the dual-API boundary. The app server is a **DigitalOcean Droplet** (default): Ubuntu LTS, at least **2 GB RAM**, Docker Engine + Compose plugin. An equivalent 2 GB VPS (Hetzner, Lightsail) is acceptable if already preferred.
2. **Cloudflare is DNS + the private gate, not the app host.** The zone already lives on Cloudflare. Apex (`quizcontext.app`) stays parked. INT is `https://int.quizcontext.app`.
3. **Confirm the zone spelling before DNS.** The purchase note read `quizconmtext.app` (extra `m`). The intended apex is `quizcontext.app`. If the Cloudflare zone is the misspelling, fix or repurchase before cutover.
4. **Caddy on the VM, outside Compose.** Caddy terminates HTTPS (or presents a Cloudflare origin cert) and reverse-proxies to `127.0.0.1:4017`. Public website ports are **80 and 443** only. SSH is restricted. Neither Express port is published on a public interface.
5. **Private INT, removable without an app change.** First cutover uses **Cloudflare Access** (Zero Trust) on `int.quizcontext.app`, limited to named tester emails. QuizContext register/login stays as-is. Going public later means disabling or bypassing that Access policy — not a product ticket. Caddy basic auth is an acceptable substitute if Access is delayed.
6. **Atlas is the INT database.** Dedicated DB name `quizcontext-int`, dedicated DB user, `MONGODB_URI` only. Network access: the Droplet’s outbound public IP (not `0.0.0.0/0` for normal operation). First INT database starts empty. Local Mongo stays the personal/dev database.
7. **Secrets stay off git.** VM env or an untracked override file, plus a password-manager copy. Same `AI_KEY_ENCRYPTION_KEY` for the life of this INT database.
8. **Redeploy is a newer git SHA on the same VM and Atlas database.** Record the deployed SHA. Rolling back application code does not roll back Mongo. Atlas free-tier backup is limited; keep a periodic `mongodump` of `quizcontext-int` somewhere off the Droplet if study content matters.

## Human preconditions (agent cannot finish these)

Do these in parallel with 9010. 9011 acceptance cannot pass without them.

1. Confirm the Cloudflare zone is exactly `quizcontext.app` (not `quizconmtext.app`).
2. Create a DigitalOcean account, SSH key, and Droplet (Ubuntu LTS, ≥2 GB). Restrict SSH to your IP or key-only login. Note the Droplet public IPv4.
3. In Cloudflare DNS, add `int` as an **A** record to that IPv4. Decide proxy status with the runbook (Access needs the hostname proxied; Caddy HTTP-01 needs grey-cloud or a DNS challenge).
4. Create a Cloudflare Access application on `int.quizcontext.app` for named testers. Keep the policy off or bypassed only while debugging DNS.
5. Create a MongoDB Atlas project/cluster, database `quizcontext-int`, a dedicated user, and an IP allowlist that includes only the Droplet IPv4 for normal operation.
6. Generate and store (password manager + VM only): `INTERNAL_API_KEY`, `JWT_SECRET`, `AI_KEY_ENCRYPTION_KEY`, and `OPENAI_API_KEY` only if you intentionally enable app-key AI. Leave `AI_ENABLED=false` until that is deliberate.
7. Keep a copy of the VM env file off the Droplet.

## In scope
- One runbook page: `docs/getting-started-hosted.md` (no `docs/deploy/` tree).
- A tracked Caddyfile (or equivalent snippet in the runbook) that proxies to loopback `4017` and does not route to `server-data`.
- Runbook sections: Droplet create + Docker install + firewall; Caddy; Cloudflare DNS + Access; Atlas; secrets; first deploy from `dev-deploy`; `GET /health` and Diagnostics; reboot restart (`restart: unless-stopped` / Caddy as a system service); redeploy by git SHA; rollback of **code only**; optional later `mongodump`.
- First cutover executed from that runbook.
- How to drop the private gate later (one Access/Caddy change).

## Out of scope
- Compose images, lockfiles, static serve, SPA fallback (9010).
- Production on the apex, a second environment, CI, preview apps.
- Merging into `main`.
- Migrating local Mongo into Atlas (one optional paragraph is enough).
- Changing QuizContext registration, JWT, or OpenAI key product behaviour.
- Rate limiting, Helmet, WAF, secrets managers, key rotation UI.
- Kubernetes, extra logging platforms, or moving the app onto Vercel/Cloudflare Pages.

## Acceptance checks
- [ ] Human preconditions above are done (zone spelling confirmed).
- [ ] `https://int.quizcontext.app` reaches the QuizContext login/register screen through the private gate.
- [ ] After the gate, register, sign in, and Diagnostics show webApp + data API + database ok.
- [ ] Browser cannot reach `server-data`. `INTERNAL_API_KEY` is not in the client bundle.
- [ ] Ports 80/443 are the only public website ports; Express ports are loopback-only.
- [ ] Redeploy-by-SHA and “rollback does not undo Mongo” are written.
- [ ] The runbook states how to remove Cloudflare Access (or Caddy basic auth) without an application change.
- [ ] `.env` / keys / `ket.txt` are not committed.

## Implementation notes
- Same git motion as 9010: add the runbook and Caddyfile on `dev-deploy`.
- `CLIENT_ORIGIN` on the VM is `https://int.quizcontext.app`.
- Prefer Cloudflare Access over changing `/auth/register`.
- If Cloudflare is proxied (orange cloud), do not use Caddy’s default HTTP-01 against the public hostname; use a Cloudflare origin certificate (Full/Strict) or a DNS-01 challenge. Grey-cloud + Caddy Let’s Encrypt is the simpler first path if Access can be added immediately after the cert works — or enable Access first and use an origin cert.
- Generate `AI_KEY_ENCRYPTION_KEY` once for INT and keep it.
