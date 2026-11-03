# Getting started hosted (INT)

This guide is the D1 cutover for `https://int.quizcontext.app`. When you finish, the Droplet serves Release-2 over HTTPS, registration works with the existing QuizContext login, and `server-data` is not reachable from the internet.

Console clicks in Cloudflare, DigitalOcean, and Atlas are already listed in [deployment-operator-checklist.md](reference/Deployment/deployment-operator-checklist.md). Do those there. This page is the copy-paste sequence on the Droplet and the checks from your laptop. Later milestones (CI, local Mongo migration, AWS) stay in [deployment-evolution-plan.md](reference/Deployment/deployment-evolution-plan.md).

The app is one INT environment, not production. Apex `quizcontext.app` stays parked. Anyone with the URL can register. There is no Cloudflare Access screen, Tunnel, email allowlist, or extra password gate.

Commands below assume the **root** shell from the checklist (`ssh -i <private-key> root@<droplet-ipv4>`). Secrets stay in your password manager and in the VM `.env`. Do not paste them into chat, git, or the handoff log.

The Droplet clone only contains this file and the root `Caddyfile` after that commit is on GitHub `dev-deploy`. If a fresh clone has no `Caddyfile`, stop and push this branch before continuing.

---

## 0. Already done before SSH

Confirm these. Do not create a second Droplet, DNS record, or cluster.

| Check | Expected |
| --- | --- |
| DNS | Cloudflare `A` record `int` → Droplet IPv4, **DNS only / grey cloud** |
| Droplet | Ubuntu 24.04 LTS, SSH key login, public IPv4 |
| Cloud firewall | Inbound 22 from your IP, plus 80 and 443. No inbound 4007 or 4017 |
| Atlas | Database `quizcontext-int`, user `quizcontext_int_app` with `readWrite` on that database, network access = Droplet IPv4 only |
| Secrets | Password manager holds `MONGODB_URI` (path `/quizcontext-int`), `INTERNAL_API_KEY`, `JWT_SECRET`, `AI_KEY_ENCRYPTION_KEY` |

`nslookup int.quizcontext.app` from your laptop should return the Droplet IPv4.

---

## 1. SSH and key-only login

```bash
cat /etc/os-release
sshd -T | grep -E '^(passwordauthentication|pubkeyauthentication|permitrootlogin) '
```

Expect Ubuntu 24.04 and `passwordauthentication no` with `pubkeyauthentication yes`. If password authentication is already `no`, leave SSH as it is.

If it prints `passwordauthentication yes`, confirm key login in a **second** terminal first. Then:

```bash
printf '%s\n' 'PasswordAuthentication no' > /etc/ssh/sshd_config.d/60-quizcontext.conf
systemctl reload ssh
```

Keep the existing root key login. Do not add another user in this cutover.

---

## 2. Host firewall

The DigitalOcean cloud firewall stays as in the checklist: 22 restricted to your IP, 80 and 443 open, 4007 and 4017 not inbound. `ufw` is the second layer on the VM. Allow SSH **before** you enable it, using the same public IPv4 as the cloud firewall. A wrong address here locks SSH; DigitalOcean’s recovery console is the way back.

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow from YOUR_PUBLIC_IPV4 to any port 22 proto tcp comment 'operator ssh'
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status verbose
```

Do not add 4007 or 4017.

Docker can bypass `ufw` for container ports published on all interfaces. Compose avoids that by publishing `server-webapp` only as `127.0.0.1:4017:4017` and by not publishing `server-data` at all. Leave those mappings as they are in `docker-compose.yml`.

---

## 3. Swap before the first image build

A 2 GB Droplet can run out of memory while `docker compose build` compiles the client. This swap is optional and recommended before the first build. It persists across reboot.

```bash
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
swapon --show
```

---

## 4. Docker Engine and Compose

Install from Docker’s Ubuntu apt repository (Noble). This includes the Compose plugin.

```bash
apt update
apt install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
docker --version
docker compose version
docker run --rm hello-world
```

`hello-world` should print a short success message and exit.

---

## 5. Caddy package

Install Caddy from the official stable apt repo. The package starts a systemd service. Its first config is a placeholder. Replace that file in section 9, after Compose is healthy.

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
rm -f /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
chmod o+r /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install -y caddy
systemctl enable --now caddy
caddy version
```

---

## 6. Clone `dev-deploy` and record the SHA

Deploy source is `dev-deploy`, then `Phase9-historyEnhance` only after that merge exists. It is not `main`. Do not move the tag `first-use-9001`.

```bash
git clone --branch dev-deploy --single-branch https://github.com/SamuelFleming/QuizContext1.git /opt/quizcontext
cd /opt/quizcontext
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
if [ ! -f Caddyfile ]; then
  echo "STOP: this commit has no Caddyfile. Commit and push dev-deploy, delete /opt/quizcontext, and clone again."
else
  install -d -m 700 /root/quizcontext
  git rev-parse HEAD | tee /root/quizcontext/deployed-sha
  chmod 600 /root/quizcontext/deployed-sha
fi
```

`HEAD` should print `dev-deploy`. `/root/quizcontext/deployed-sha` is the record of what is deployed. Update it on every redeploy.

If GitHub refuses the HTTPS clone, add a **read-only** deploy key. Do not put a personal access token in the remote URL.

```bash
install -d -m 700 /root/.ssh
ssh-keygen -t ed25519 -f /root/.ssh/quizcontext_deploy -N ""
cat /root/.ssh/quizcontext_deploy.pub
```

In GitHub: repository **Settings → Deploy keys → Add deploy key**. Paste the public key. Leave write access off.

Run the clone below only when the HTTPS clone failed. It deletes an incomplete `/opt/quizcontext`. Skip it when that directory already contains `Caddyfile`.

```bash
cat >> /root/.ssh/config <<'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile /root/.ssh/quizcontext_deploy
  IdentitiesOnly yes
EOF
chmod 600 /root/.ssh/config
ssh-keyscan -t ed25519 github.com >> /root/.ssh/known_hosts
rm -rf /opt/quizcontext
git clone --branch dev-deploy --single-branch git@github.com:SamuelFleming/QuizContext1.git /opt/quizcontext
```

Then run the `git rev-parse` and `deployed-sha` commands from the HTTPS block.

---

## 7. VM env file

Compose reads `/opt/quizcontext/.env` for `${VAR}` substitution. It then injects **only** the names listed under `environment:` in `docker-compose.yml`. The file is not copied wholesale into both containers.

`server-data` receives `PORT=4007`, `MONGODB_URI`, and `INTERNAL_API_KEY`.

`server-webapp` receives `PORT=4017`, `CLIENT_ORIGIN`, `DATA_API_BASE_URL=http://server-data:4007`, `INTERNAL_API_KEY`, `JWT_SECRET`, `AI_KEY_ENCRYPTION_KEY`, `OPENAI_API_KEY`, `AI_ENABLED`, and `AI_TIMEOUT_MS`.

`DATA_API_BASE_URL` and both `PORT` values are set in the Compose file. The React API base is the image build-arg `VITE_WEB_API_BASE_URL` (empty, so the browser calls the same origin). Do not put `PORT`, `DATA_API_BASE_URL`, or `VITE_WEB_API_BASE_URL` in `.env`.

```bash
cd /opt/quizcontext
cp .env.example .env
chmod 600 .env
```

Edit `.env` from the password manager:

- `MONGODB_URI` — Atlas SRV URI. The path must be `/quizcontext-int` before any `?`. Percent-encode `@`, `:`, `/`, `#`, and `?` inside the password.
- `INTERNAL_API_KEY` — one new INT value. Compose passes that same value to both services.
- `JWT_SECRET` — new INT value, different from your laptop.
- `AI_KEY_ENCRYPTION_KEY` — 32-byte base64, generated once for this database. Keep it for the life of `quizcontext-int`. Replacing it later makes stored user OpenAI keys unreadable.
- `OPENAI_API_KEY` — leave empty.
- `AI_ENABLED=false`
- `CLIENT_ORIGIN=https://int.quizcontext.app`
- `AI_TIMEOUT_MS=20000` — already in the example.

Keep a copy of these values in the password manager. Do not commit `.env`.

---

## 8. Start Compose

```bash
cd /opt/quizcontext
docker compose up --build -d
docker compose ps
docker compose port server-webapp 4017
docker compose port server-data 4007 || echo "expected: server-data has no published port"
ss -ltn | grep -E ':4007|:4017' || true
curl -fsS http://127.0.0.1:4017/health
```

The first build can take several minutes. If it is killed for lack of memory, complete section 3 and run `docker compose up --build -d` again.

Expect:

- `docker compose port server-webapp 4017` prints `127.0.0.1:4017`
- `server-data` has no published port (the `|| echo` line runs)
- `ss` shows `127.0.0.1:4017` only, not `0.0.0.0:4017` and not port `4007`
- health JSON contains `"service":"server-webApp"` and `"status":"ok"`

Log names are the Compose service names `server-webapp` and `server-data`.

---

## 9. Install the site Caddyfile and obtain the certificate

Caddy needs port 80 reachable on `int.quizcontext.app` for Let’s Encrypt HTTP-01. That requires grey-cloud DNS. An orange-cloud proxy makes this issuance fail. Leave the record DNS-only. Do not switch the fix to Cloudflare Tunnel.

```bash
cp /opt/quizcontext/Caddyfile /etc/caddy/Caddyfile
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
```

If reload reports that Caddy is inactive, run `systemctl enable --now caddy` and then `systemctl reload caddy`.

The tracked file proxies `int.quizcontext.app` to `127.0.0.1:4017` only. It has no site for `server-data` and no basic auth.

Watch issuance if the public check below fails:

```bash
journalctl -u caddy -n 80 --no-pager
```

---

## 10. Checks from outside the Droplet

On the Droplet, loopback health can succeed while the public site is still wrong. Use a laptop or phone that is not the Droplet.

PowerShell:

```powershell
curl.exe -fsSI https://int.quizcontext.app/health
curl.exe -fsS https://int.quizcontext.app/health
curl.exe -fsSI https://int.quizcontext.app/profile
```

`/health` returns JSON (`server-webApp`, `ok`). `/profile` returns `content-type: text/html`. A refresh of `/profile` or `/subjects/...` is the SPA, served by `server-webApp`.

In a browser, open `https://int.quizcontext.app`. You should see QuizContext login/register and no Cloudflare Access or extra SSO page.

1. Register a user and sign in.
2. Open **Service status** (also `https://int.quizcontext.app/diagnostics`). Business API, Data API, and Database should all be OK.
3. **Subjects → Create subject**, then open it and add one topic (**New topic**).
4. Refresh `/profile` and the subject page. Both should render again.
5. Repeat sign-in from a phone or another network.

From the laptop, both of these should fail (timeout or connection refused). Replace the address with the Droplet IPv4:

```powershell
curl.exe -m 10 -I http://DROPLET_IP:4007/health
curl.exe -m 10 -I http://DROPLET_IP:4017/health
```

`https://int.quizcontext.app/health` should still succeed. Public listeners are 80 and 443 only.

In the browser devtools, search the loaded JavaScript for `INTERNAL_API_KEY` and for `http://localhost:4017`. Neither string should appear. The hosted client calls the same origin.

Skip quiz generation unless you have chosen to enable AI (section 13).

---

## 11. Reboot

Compose uses `restart: unless-stopped`. Caddy and Docker are enabled in systemd. After this reboot, do not run `docker compose up` unless the site stays down.

```bash
systemctl is-enabled docker
systemctl is-enabled caddy
reboot
```

Wait for the Droplet to return, then from the laptop:

```powershell
curl.exe -fsS https://int.quizcontext.app/health
```

If you SSH in afterwards, `docker compose ps` in `/opt/quizcontext` should show both services up without a new `up` command.

---

## 12. Logs, redeploy, rollback

Logs:

```bash
cd /opt/quizcontext
docker compose logs --tail=200 server-webapp
docker compose logs --tail=200 server-data
journalctl -u caddy -n 100 --no-pager
```

A newer build uses the **same** Droplet and the **same** Atlas database `quizcontext-int`. Do not change `MONGODB_URI` or `AI_KEY_ENCRYPTION_KEY` as part of a code deploy.

```bash
cd /opt/quizcontext
git fetch origin
git checkout dev-deploy
git pull --ff-only origin dev-deploy
git rev-parse HEAD | tee /root/quizcontext/deployed-sha
chmod 600 /root/quizcontext/deployed-sha
docker compose up --build -d
```

To run a specific commit that is already on that branch (still not `main`):

```bash
cd /opt/quizcontext
git fetch origin
git checkout --detach SHA
git rev-parse HEAD | tee /root/quizcontext/deployed-sha
chmod 600 /root/quizcontext/deployed-sha
docker compose up --build -d
```

Rollback is the same with an older git SHA. It replaces the running images. It does **not** undo MongoDB. Users, subjects, quizzes, and attempts already stored in `quizcontext-int` remain. Do not `mongorestore` to undo a deploy.

If you change `.env`, recreate so the containers pick it up:

```bash
cd /opt/quizcontext
docker compose up -d --force-recreate
```

---

## 13. OpenAI spend on INT

Leave `AI_ENABLED=false` and `OPENAI_API_KEY` empty until you deliberately choose otherwise.

`AI_ENABLED=false` blocks the **application** key only. In `server-webApp/src/openai/keyResolver.js`, a user whose Profile mode is **My own OpenAI key** is resolved first, and that call does not consult `AI_ENABLED`. New accounts default to application mode (`server-data/src/models/user.js`), so quiz generation fails with AI disabled until that person switches Profile to **My own OpenAI key** and saves a key.

The application-key cap is **100000** tokens per user per month, from `APP_MONTHLY_TOKEN_LIMIT` in `server-webApp/src/constants/aiExperiment/baseline.js`. The env example `AI_APP_MONTHLY_TOKEN_LIMIT` is not what the running code reads. User-supplied keys are not limited by that 100000 cap (`server-webApp/src/openai/usageLimit.js`).

For a classmate, keep the application key off and have them use their own key. Invite them only after you have read this section. Send only the URL. They register themselves. INT is not production. They should keep a copy of anything they cannot lose until an off-Droplet dump exists (section 15).

---

## 14. Atlas connectivity

If Service status shows Database failed, or `docker compose logs server-data` reports a server selection timeout:

- Atlas **Network Access** lists the Droplet public IPv4 and does not list `0.0.0.0/0` for normal operation.
- `MONGODB_URI` uses `mongodb+srv://` and includes `/quizcontext-int` before `?`.
- The database user is `quizcontext_int_app` with `readWrite` on `quizcontext-int` (authentication database `admin`).
- Special characters in the password are percent-encoded. Do not print the URI to check it.

`server-data` waits 30 seconds for server selection on `mongodb+srv://` URIs. After you fix the allowlist or the URI:

```bash
cd /opt/quizcontext
docker compose up -d --force-recreate server-data
docker compose logs --tail=100 server-data
```

Then reload Service status. The database named `quizcontext-int` may appear in Atlas only after the first write.

---

## 15. Backup, and why local Mongo stays local

Atlas free tier does not provide a full point-in-time enterprise restore. In the Atlas UI, turn on the backup that tier actually offers, and write down what it does not cover. Do not describe a restore button you have not seen there.

When INT holds study data you would mind losing, dump it from the Droplet (that IP is the one Atlas allows) and copy the archive off the VM. Install the database tools only. Do not install `mongodb-org`; that package is a MongoDB server, and INT data lives in Atlas.

```bash
apt-get install -y gnupg curl
rm -f /usr/share/keyrings/mongodb-server-8.0.gpg
curl -fsSL https://pgp.mongodb.com/server-8.0.asc | gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-8.0.list
apt-get update
apt-get install -y mongodb-database-tools
mongodump --version
```

```bash
cd /opt/quizcontext
umask 077
MONGODB_URI="$(sed -n 's/^MONGODB_URI=//p' .env)"
mongodump --uri="$MONGODB_URI" --archive=/root/quizcontext/quizcontext-int.archive.gz --gzip
unset MONGODB_URI
chmod 600 /root/quizcontext/quizcontext-int.archive.gz
```

From the laptop:

```powershell
scp -i PATH_TO_PRIVATE_KEY root@DROPLET_IP:/root/quizcontext/quizcontext-int.archive.gz .
```

Then delete the copy on the VM:

```bash
shred -u /root/quizcontext/quizcontext-int.archive.gz || rm -f /root/quizcontext/quizcontext-int.archive.gz
```

Store the laptop copy outside git. This archive is `quizcontext-int`. It is not the laptop database `mongodb://127.0.0.1:27017/quizcontext`.

Copying that laptop database into Atlas is a D2 decision in [deployment-evolution-plan.md](reference/Deployment/deployment-evolution-plan.md), not part of this cutover. After a classmate uses INT, Atlas is shared study data. Do not `mongorestore` a laptop dump over it. A code rollback does not restore or erase Mongo. The INT `AI_KEY_ENCRYPTION_KEY` is a different key from the laptop, so user API keys encrypted on one side cannot be decrypted on the other. Until an explicit D2 decision, INT stays the hosted database and the laptop MongoDB stays a separate development database.

---

## 16. As-built record

After the smoke checks, append one row to section 7 of [QuizContext-D1-Infrastructure-Handoff.md](devTickets/phase9/QuizContext-D1-Infrastructure-Handoff.md). Include the date, `docker --version`, `docker compose version`, `caddy version`, the Ubuntu version, the SHA in `/root/quizcontext/deployed-sha`, what you tested, and any problem plus the fix. Redact every secret. Do not paste `.env`, the Atlas URI, or keys into that log or into git.

Do not commit `.env`, `ket.txt`, SSH private keys, or dump archives.
